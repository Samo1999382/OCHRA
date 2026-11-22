"""Download individual full videos from Appendix300 without fetching whole ZIP parts.
Python 3 standard library only. No arguments: list files. --count 3: fetch three
smallest single-file cases not already downloaded. --video NAME: select exactly.
"""
import argparse
import pathlib
import struct
import urllib.request
import zlib

BASE = 'https://opara.zih.tu-dresden.de/server/api/core/bitstreams/'
IDS = ['79c7da37-1528-4b4c-a2bc-cd5902e9d7a3',
       '58fedbb8-217c-4dbc-a5dd-0aa05db33462',
       '45ddcca7-0ee0-46de-bad6-88602192fcce',
       'a97390ae-438b-41fd-a0d3-44917a505a3b',
       'c444b1d6-f6e9-4974-a479-54075e95c06c',
       '19c0d57a-389a-4579-b8b3-9ef5f18586e1']
PART_SIZE = 268435456000
DEFAULT_OUTPUT = pathlib.Path(__file__).resolve().parent / 'videos'


def request(disk, start, size):
    if size <= 0 or not 0 <= disk < len(IDS):
        raise ValueError('Invalid archive range')
    end = start + size - 1
    req = urllib.request.Request(BASE + IDS[disk] + '/content', headers={
        'Range': f'bytes={start}-{end}', 'Accept-Encoding': 'identity'})
    response = urllib.request.urlopen(req, timeout=60)
    if response.status != 206 or not response.headers.get('Content-Range', '').startswith(f'bytes {start}-{end}/'):
        response.close()
        raise RuntimeError('Server ignored byte range; download stopped')
    return response


def read(disk, start, size):
    if size > 2 * 1024**2:
        raise ValueError('Metadata request too large')
    with request(disk, start, size) as response:
        data = response.read(size + 1)
    if len(data) != size:
        raise RuntimeError('Incomplete metadata response')
    return data


def entries():
    final_size = 18145831801
    tail = read(5, final_size - 65557, 65557)
    pos = tail.rfind(b'PK\x06\x06')
    if pos < 0:
        raise RuntimeError('ZIP64 directory missing')
    record = struct.unpack_from('<4sQ2H2L4Q', tail, pos)
    directory = read(record[5], record[9], record[8])
    files, pos, total = [], 0, 0
    while pos < len(directory):
        f = struct.unpack_from('<4s6H3L5H2L', directory, pos)
        if f[0] != b'PK\x01\x02':
            raise RuntimeError('Invalid ZIP directory')
        flags, method, crc, compressed, size = f[3], f[4], f[7], f[8], f[9]
        n, x, c, disk, offset = f[10], f[11], f[12], f[13], f[16]
        name = directory[pos+46:pos+46+n].decode('utf-8' if flags & 2048 else 'cp437')
        extra = directory[pos+46+n:pos+46+n+x]
        ep = 0
        while ep + 4 <= len(extra):
            tag, length = struct.unpack_from('<HH', extra, ep)
            value = extra[ep+4:ep+4+length]
            if tag == 1:
                vp = 0
                if size == 0xffffffff:
                    size = struct.unpack_from('<Q', value, vp)[0]; vp += 8
                if compressed == 0xffffffff:
                    compressed = struct.unpack_from('<Q', value, vp)[0]; vp += 8
                if offset == 0xffffffff:
                    offset = struct.unpack_from('<Q', value, vp)[0]; vp += 8
                if disk == 0xffff:
                    disk = struct.unpack_from('<L', value, vp)[0]
            ep += 4 + length
        if name.startswith('Full_Videos/') and name.lower().endswith('.mp4'):
            files.append(dict(name=name, flags=flags, method=method, crc=crc,
                              compressed=compressed, size=size, disk=disk, offset=offset))
        pos += 46 + n + x + c
        total += 1
    if total != record[7]:
        raise RuntimeError('ZIP directory count mismatch')
    return sorted(files, key=lambda item: item['size'])


def basename(entry):
    return pathlib.PurePosixPath(entry['name']).name


def extract(entry, folder):
    target = folder / basename(entry)
    partial = target.with_suffix('.mp4.part')
    if target.exists() or partial.exists():
        raise FileExistsError(f'Refusing to overwrite {target} or its .part file')
    if entry['flags'] & 1 or entry['method'] not in (0, 8):
        raise RuntimeError('Unsupported compression or encryption')
    header = read(entry['disk'], entry['offset'], 30)
    if header[:4] != b'PK\x03\x04':
        raise RuntimeError('Invalid file header')
    n, x = struct.unpack_from('<HH', header, 26)
    offset = entry['offset'] + 30 + n + x
    disk, offset = entry['disk'] + offset // PART_SIZE, offset % PART_SIZE
    remaining, crc, written = entry['compressed'], 0, 0
    decoder = zlib.decompressobj(-15) if entry['method'] == 8 else None
    folder.mkdir(parents=True, exist_ok=True)
    with partial.open('xb') as output:
        while remaining:
            amount = min(remaining, PART_SIZE-offset)
            with request(disk, offset, amount) as response:
                left = amount
                while left:
                    chunk = response.read(min(left, 1024**2))
                    if not chunk:
                        raise RuntimeError('Interrupted download; partial file retained')
                    left -= len(chunk); remaining -= len(chunk)
                    data = decoder.decompress(chunk) if decoder else chunk
                    output.write(data); written += len(data); crc = zlib.crc32(data, crc)
                    print(f'\r{target.name}: {written/1024**2:.1f} MiB', end='', flush=True)
            disk += 1; offset = 0
        if decoder:
            data = decoder.flush(); output.write(data)
            written += len(data); crc = zlib.crc32(data, crc)
            if not decoder.eof:
                raise RuntimeError('Incomplete compressed stream')
    if written != entry['size'] or crc != entry['crc']:
        raise RuntimeError('CRC/size check failed; partial file retained')
    partial.rename(target)
    print(f'\nVerified: {target}')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    group = parser.add_mutually_exclusive_group()
    group.add_argument('--video', action='append', help='Exact MP4 basename; repeat to select multiple')
    group.add_argument('--count', type=int, help='Download N smallest remaining single-file cases')
    parser.add_argument('--output', type=pathlib.Path, default=DEFAULT_OUTPUT)
    args = parser.parse_args()
    if args.count is not None and args.count < 1:
        parser.error('--count must be positive')
    videos = entries()
    if not args.video and args.count is None:
        print(f'{len(videos)} full-video archive MP4s. Smallest first:')
        for e in videos:
            print(f"{e['size']/1024**2:9.2f} MiB  {basename(e)}")
        return
    if args.count is not None:
        selected = [e for e in videos if '_v' not in basename(e)
                    and not (args.output/basename(e)).exists()
                    and not (args.output/(basename(e)+'.part')).exists()][:args.count]
        if len(selected) != args.count:
            parser.error('Not enough remaining single-file videos')
    else:
        selected = []
        for name in dict.fromkeys(args.video):
            matches = [e for e in videos if basename(e) == name]
            if len(matches) != 1:
                parser.error(f'Video absent or ambiguous: {name}')
            selected.append(matches[0])
    print(f"Downloading {len(selected)} videos, {sum(e['compressed'] for e in selected)/1024**2:.2f} MiB")
    for e in selected:
        extract(e, args.output)


if __name__ == '__main__':
    main()
