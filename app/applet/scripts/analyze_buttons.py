import glob, re

output = []
output.append("=== ALL DISABLED BUTTONS ===")
for f in sorted(glob.glob('/app/applet/src/**/*.tsx', recursive=True)):
    content = open(f, encoding='utf-8').read()
    for m in re.finditer(r'<button\s+([^>]+)>', content):
        attrs = m.group(1)
        if 'disabled' in attrs:
            c = re.search(r'className=(?:\{`([^`]+)`\}|"([^"]+)"|\'([^\']+)\')', attrs)
            cn = (c.group(1) or c.group(2) or c.group(3) or '') if c else ''
            output.append(f"{f.replace('/app/applet/', '')} ::: {cn.strip()}")

output.append("\n=== ALL BUTTONS WITH text-slate OR text-gray OR text-white OR bg-slate ===")
for f in sorted(glob.glob('/app/applet/src/**/*.tsx', recursive=True)):
    content = open(f, encoding='utf-8').read()
    for m in re.finditer(r'<button\s+([^>]+)>', content):
        attrs = m.group(1)
        c = re.search(r'className=(?:\{`([^`]+)`\}|"([^"]+)"|\'([^\']+)\')', attrs)
        cn = (c.group(1) or c.group(2) or c.group(3) or '') if c else ''
        if any(k in cn for k in ['text-slate', 'text-gray', 'text-zinc', 'bg-slate', 'bg-zinc', 'text-white', 'border-slate']):
            output.append(f"{f.replace('/app/applet/', '')} ::: {cn.strip()}")

with open('/app/applet/button_report.txt', 'w', encoding='utf-8') as out:
    out.write("\n".join(output))
print("WROTE REPORT")
