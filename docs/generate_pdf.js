const markdownpdf = require('markdown-pdf');
const path = require('path');
const fs = require('fs');

const inputFile = path.join(__dirname, 'ANNAM_AI_Technical_Documentation_PS02_PS03.md');
const outputFile = path.join(__dirname, 'ANNAM_AI_PS02_PS03_Technical_Documentation.pdf');

const cssPath = path.join(__dirname, 'pdf_style.css');

const options = {
  cssPath: fs.existsSync(cssPath) ? cssPath : undefined,
  paperFormat: 'A4',
  paperBorder: '1.5cm',
  remarkable: {
    html: true,
    breaks: true
  }
};

console.log('Generating PDF from:', inputFile);
console.log('Output:', outputFile);

markdownpdf(options)
  .from(inputFile)
  .to(outputFile, function () {
    console.log('PDF generated successfully!');
    console.log('File:', outputFile);
  });
