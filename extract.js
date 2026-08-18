const fs = require('fs');
const files = {
  'gestionpro': '469',
  'acerta': '470',
  'dreambis': '471',
  'leadup': '472',
  'ucm': '475',
  'lepetitbureau': '476',
  'investconseil': '477',
  'siegesocial': '478',
  'avium': '481',
  'microstart': '483',
  'workall': '484'
};
const dir = '/home/thierry-ninja/.gemini/antigravity/brain/4086c567-d418-4399-924a-fcbc91c04e6e/.system_generated/steps/';
let output = {};
for (const [id, step] of Object.entries(files)) {
  const path = `${dir}${step}/content.md`;
  if (fs.existsSync(path)) {
    const text = fs.readFileSync(path, 'utf8');
    const lines = text.split('\n');
    let contentBlocks = [];
    let currentBlock = [];
    let capture = false;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('[Contact](https://gestionpro.be/contact/)')) {
        capture = true;
        currentBlock = [];
        continue;
      }
      if (capture && (lines[i].includes('[Être Rappeler]') || lines[i].includes('Retrouvez-nous'))) {
        capture = false;
        if (currentBlock.length > 0) {
          contentBlocks.push(currentBlock.join('<br>'));
        }
      }
      if (capture) {
        let line = lines[i].trim();
        if (line !== '' && !line.startsWith('[') && !line.startsWith('##') && !line.startsWith('- [')) {
          currentBlock.push(line);
        }
      }
    }
    
    // Sort blocks by length to find the actual content
    contentBlocks.sort((a, b) => b.length - a.length);
    if (contentBlocks.length > 0) {
      output[id] = contentBlocks[0];
    } else {
      output[id] = "";
    }
  }
}
console.log(JSON.stringify(output, null, 2));
