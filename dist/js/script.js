const canvas = document.getElementById('canvas');
const canvasgraph = document.getElementById('canvasgraph');
const ctx = canvas.getContext('2d');
let ctx2 = canvasgraph.getContext('2d');


let dataPoints = [];
let wavelengths = [];
let whatIsIt = '';
let VLArray = [];
let IRArray = [];

function whichDownload() {
    if (whatIsIt === 'UV') {
        downloadSortedWavelengths();
    } else if (whatIsIt === 'Visible Light') {
        downloadSortedWavelengthsVL();
    } else if (whatIsIt === 'IR') {
        downloadSortedWavelengthsIR();
    }
}


function analyzeImage(value) {
    const input = document.getElementById('imageInput');
    const file = input.files[0];


    if (file) {
        const reader = new FileReader();

        reader.onload = function (e) {
            const img = new Image();

            img.onload = function () {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0, img.width, img.height);

                if (value === 'UV') {
                    whatIsIt = 'UV';
                    dataPoints = [];
                    wavelengths = [];
                    VLArray = [];
                    ctx2.clearRect(0, 0, canvasgraph.width, canvasgraph.height); // Clear the canvas.
                    analyzeSpectrum();
                    drawGraph();
                } else if (value === 'VisibleLight') {
                    whatIsIt = 'Visible Light';
                    dataPoints = [];
                    wavelengths = [];
                    VLArray = [];
                    ctx2.clearRect(0, 0, canvasgraph.width, canvasgraph.height); // Clear the canvas.
                    analyzeSpectrum();
                    drawGraphVL();
                } else if (value === 'IR') {
                    whatIsIt = 'IR';
                    dataPoints = [];
                    wavelengths = [];
                    VLArray = [];
                    ctx2.clearRect(0, 0, canvasgraph.width, canvasgraph.height); // Clear the canvas.
                    analyzeSpectrum();
                    drawGraphIR();
                }

                // console.log(dataPoints);
                // console.log(wavelengths);


            };

            img.src = e.target.result;

        };

        reader.readAsDataURL(file);
    }
}

function analyzeSpectrum() {
    for (let x = 0; x < canvas.width; x++) {
        const columnData = ctx.getImageData(x, 0, 1, canvas.height).data;
        let alphaCode = 0;
        let VLCode = 0;
        let IRCode = 0;

        if (whatIsIt === 'UV') {
            alphaCode = getAlphaCodeForColumnUV(columnData, x);
        } else if (whatIsIt === 'Visible Light') {
            VLCode = getAlphaCodeForColumnVL(columnData, x, canvas.width);
        } else if (whatIsIt === 'IR') {
            IRCode = getAlphaCodeForColumnIR(columnData, x);
        }


        // console.log(colorCode);
        dataPoints.push({x: x, y: alphaCode.averageAlpha, yVL: VLCode.averageAlpha, yIR: IRCode.averageAlpha, cIR: IRCode.wavelengthtest, cUV: alphaCode.wavelengthtest, cVL: VLCode.wavelengthtest});


    }
    return 0;
}


function getAlphaCodeForColumnUV(columnData, x) {
    let totalAlpha = 0;

    for (let i = 0; i < columnData.length; i += 5) {
        totalAlpha += columnData[i];
    }

    const averageAlpha = totalAlpha / (columnData.length / 5 / 5);
    const minPosition = 0;
    const maxPosition = canvas.width;

    const calculatedPosition = Math.min(Math.max(x, minPosition), maxPosition);

    let wavelengthtest = 0;
    if (averageAlpha >= 940) {

        // Calculate the wavelength based on the position
        const minWavelength = 10; // corresponds to minPosition
        const maxWavelength = 380; // corresponds to maxPosition


        wavelengthtest = minWavelength + ((calculatedPosition - minPosition) / (maxPosition - minPosition)) * (maxWavelength - minWavelength);
        wavelengthtest = Math.round(wavelengthtest * 100) / 100;
    }


    return {averageAlpha, wavelengthtest};
}



function drawGraph() {
    const scalingFactor = 50;
    const scalingFactorPeak = 20;


    ctx2.clearRect(0, 0, canvasgraph.width, canvasgraph.height);

    ctx2.beginPath();
    canvasgraph.width = canvas.width;
    canvasgraph.height = canvas.height;
    ctx2.fillStyle = 'white';
    ctx2.moveTo(0, 0);
    ctx2.lineTo(0, canvasgraph.height);
    ctx2.lineTo(canvasgraph.width, canvasgraph.height);
    ctx2.stroke();
    ctx2.beginPath();

    dataPoints.forEach((point, index) => {
        let scaledY = 0;
        if (point.y >= 940) {
            scaledY = canvasgraph.height - point.y / scalingFactorPeak;

            wavelengths.push({ x: point.x, c: point.cUV });



        } else {
            scaledY = canvasgraph.height - point.y / scalingFactor;
        }
        const updatedX = point.x;

        ctx2.lineTo(updatedX, scaledY);
    });

    // console.log(dataPoints);

    ctx2.strokeStyle = 'blue';

    ctx2.stroke();
    ctx2.fill();

    ctx2.closePath();

    return 0;

}





function downloadSortedWavelengths() {
    const filteredWavelengths = wavelengths.filter(item => item.c !== 0);
    const sortedWavelengths = filteredWavelengths.slice().sort((a, b) => a.x - b.x);

    let regularFont = '../../font/Montserrat-Regular.ttf';

    if (sortedWavelengths.length === 0) {
        alert('No valid data to download!');
        return;
    }

    const pdf = new jsPDF();

    const date = new Date();
    const day = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' ' + date.getHours() + ':' + date.getMinutes();

    // Page 1
    pdf.setFontSize(16);
    pdf.addFont(regularFont);
    pdf.text(`Spectroscopy`, 10, 10);

    pdf.setFontSize(10);
    pdf.addFont(regularFont);
    pdf.text(`${day}`, 170, 10);

    pdf.setDrawColor(0, 0, 0);
    pdf.line(0, 15, 10000, 15);

    const inputImgURL = canvas.toDataURL();
    const graphImgURL = canvasgraph.toDataURL();

    pdf.setFontSize(40); // Convert rem to px (1rem = 16px)
    pdf.text(10, 30, `${whatIsIt} Spectrum`);

    pdf.addImage(inputImgURL, 'JPEG', 10, 40, 90, 20);
    pdf.addImage(graphImgURL, 'JPEG', 10, 65, 90, 20);


    pdf.setFontSize(14);
    pdf.addFont(regularFont);
    pdf.text(10, 100, "The list is from left to right.");
    let yPosition = 110;

    let loopCount = 0;
    let secondpage = 0;
    let howManyPerPage = 26;

    sortedWavelengths.forEach(item => {
        // Überprüfen, ob die maximale Anzahl von Schleifeniterationen erreicht ist

        if (secondpage > 26) {
            howManyPerPage = 41;
        }


        if (loopCount < howManyPerPage) {
            pdf.addFont(regularFont);
            pdf.text(10, yPosition, `Position (Pixel): ${item.x},         Wavelength: ${item.c}nm`);
            yPosition += 7;

            // Inkrementiere die Zählvariable
            loopCount++;
            secondpage++;
        } else {
            // Falls die maximale Anzahl von Schleifeniterationen erreicht ist, füge eine neue Seite hinzu
            pdf.addPage();

            // Setze die Zählvariable zurück
            yPosition = 10;
            loopCount = 0;
        }
    });


    // Add second page
    pdf.addPage();
    pdf.setFontSize(28);
    pdf.text("Important note about our  \n" +
        "web-based spectroscopy software!", 10, 20);

    // Add Lorem Ipsum text (you can replace this with your actual text)
    pdf.setFontSize(16);
    pdf.text("We are pleased to present our innovative web-based spectroscopy software, \n" +
        "which is tailored to your analytical needs. However, as the sole developer, \n" +
        "I must emphasize that the software may not be completely bug-free.", 10, 45);

    pdf.setFontSize(16);
    pdf.text("Although I have invested a great deal of time and effort to ensure \n" +
        "the reliability of the software, I strongly recommend that users thoroughly \n" +
        "review the software and check for potential problems before relying on the \n" +
        "software's results.", 10, 75);

    pdf.setFontSize(16);
    pdf.text("I would also like to point out that, as the sole creator, \n" +
        "I cannot accept any liability for the consequences of using the software \n" +
        "or the data it calculates. Users are encouraged to use the software responsibly \n" +
        "and to recognize their own responsibility \n" +
        "for the interpretation and application of the results.", 10, 105);

    pdf.setFontSize(16);
    pdf.text("Your feedback is invaluable and I will endeavor to address any issues \n" +
        "or concerns that may arise. If you have any questions or encounter any \n" +
        "difficulties, please feel free to contact me directly.", 10, 145);

    pdf.setFontSize(16);
    pdf.text("Thank you for choosing our web-based spectroscopy software. \n" +
        "I greatly appreciate your understanding and cooperation as I work to \n" +
        "improve and refine the software to ensure an optimal user experience.", 10, 175);


    // Save the PDF
    pdf.save(`Spectroscopy ${whatIsIt}.pdf`);
}




