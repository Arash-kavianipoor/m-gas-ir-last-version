const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '..', 'node_modules', 'app-builder-lib', 'out', 'targets', 'nsis', 'NsisTarget.js');

if (fs.existsSync(targetFile)) {
  let content = fs.readFileSync(targetFile, 'utf8');
  
  const searchPattern = /if \(\(0, macosVersion_1\.isMacOsCatalina\)\(\)\) \{\s*try \{\s*await nsisUtil_1\.UninstallerReader\.exec\(installerPath, uninstallerPath\);/g;
  
  if (content.match(searchPattern)) {
    const originalBlock = `        if ((0, macosVersion_1.isMacOsCatalina)()) {
            try {
                await nsisUtil_1.UninstallerReader.exec(installerPath, uninstallerPath);
            }
            catch (error) {
                builder_util_1.log.warn(\`packager.vm is used: \${error.message}\`);
                const vm = await packager.vm.value;
                await vm.exec(installerPath, []);
                // Parallels VM can exit after command execution, but NSIS continue to be running
                let i = 0;
                while (!(await (0, builder_util_1.exists)(uninstallerPath)) && i++ < 100) {
                    // noinspection JSUnusedLocalSymbols
                    await new Promise((resolve, _reject) => setTimeout(resolve, 300));
                }
            }
        }
        else {
            const wineVm = new WineVm_1.WineVmManager((_a = packager.config.toolsets) === null || _a === void 0 ? void 0 : _a.wine);
            await wineVm.exec(installerPath, [], { env: { __COMPAT_LAYER: "RunAsInvoker" } });
        }`;

    const patchedBlock = `        try {
            await nsisUtil_1.UninstallerReader.exec(installerPath, uninstallerPath);
        }
        catch (error) {
            builder_util_1.log.warn(\`UninstallerReader fallback: \${error.message}\`);
            if ((0, macosVersion_1.isMacOsCatalina)()) {
                const vm = await packager.vm.value;
                await vm.exec(installerPath, []);
                let i = 0;
                while (!(await (0, builder_util_1.exists)(uninstallerPath)) && i++ < 100) {
                    await new Promise((resolve, _reject) => setTimeout(resolve, 300));
                }
            }
            else {
                const wineVm = new WineVm_1.WineVmManager((_a = packager.config.toolsets) === null || _a === void 0 ? void 0 : _a.wine);
                await wineVm.exec(installerPath, [], { env: { __COMPAT_LAYER: "RunAsInvoker" } });
            }
        }`;

    if (content.includes(originalBlock)) {
      content = content.replace(originalBlock, patchedBlock);
      fs.writeFileSync(targetFile, content, 'utf8');
      console.log('Successfully patched NsisTarget.js for Wine-free Linux NSIS uninstaller generation!');
    } else {
      console.log('NsisTarget.js exact block not found, performing regex replacement');
      content = content.replace(/if \(\(0, macosVersion_1\.isMacOsCatalina\)\(\)\)/, 'if (true /* patched for Linux Wine-free */)');
      fs.writeFileSync(targetFile, content, 'utf8');
      console.log('Regex replacement applied to NsisTarget.js');
    }
  } else {
    console.log('NsisTarget.js already patched or pattern not found.');
  }
} else {
  console.log('NsisTarget.js does not exist yet.');
}
