const canvas = document.getElementById('canvas');
const canvasgraph = document.getElementById('canvasgraph');
const ctx = canvas.getContext('2d');
const ctx2 = canvasgraph.getContext('2d');


const dataPoints = [];
const WavelengthPeak = [];


function analyzeImage() {
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



                analyzeSpectrum();

                drawGraph();

                console.log(WavelengthPeak);
            };

            img.src = e.target.result;

        };

        reader.readAsDataURL(file);
    }
}

function analyzeSpectrum() {
    for (let x = 0; x < canvas.width; x++) {
        const columnData = ctx.getImageData(x, 0, 1, canvas.height).data;

        const colorCode = getColorCodeForColumn(columnData);

        const wavelength = colorToWavelength(colorCode);

        // console.log(`Wavelength for pixel at (${x}): ${wavelength} nm`);
        // console.log(`Wavelength for pixel at (${x}): ${Object.values(colorCode)} nm`);

        // console.log('X: ' + x);
        console.log('Y: ' + wavelength);

        dataPoints.push({x: x, y: wavelength});
    }
}


function getColorCodeForColumn(columnData) {
    let totalRed = 0;
    let totalGreen = 0;
    let totalBlue = 0;

    for (let i = 0; i < columnData.length; i += 4) {
        totalRed += columnData[i];
        totalGreen += columnData[i + 1];
        totalBlue += columnData[i + 2];
    }

    const averageRed = totalRed / (columnData.length / 4);
    const averageGreen = totalGreen / (columnData.length / 4);
    const averageBlue = totalBlue / (columnData.length / 4);

    return {averageRed, averageGreen, averageBlue};
}

function colorToWavelength(rgb) {
    const IntensityMax = 255; // Assuming IntensityMax is defined somewhere
    const normalizedRgb = Object.values(rgb).map(value => value / IntensityMax);

    let wavelength = 380;


    // Find the dominant color component
    const maxColorCTW = Math.max(...normalizedRgb);


    const maxIndex = normalizedRgb.indexOf(maxColorCTW);

    // console.log(maxIndex);
    // console.log(maxColor);

    switch (maxIndex) {
        case 0: // Red is dominant
        case 1: // Green is dominant
        case 2: // Blue is dominant
            wavelength += maxColorCTW * (780 - 380);
            break;
        default:
            break;
    }
    return wavelength;
}


function drawGraph() {
    for (let i = 0; i < dataPoints.length; i++) {
        const point = dataPoints[i];
        if (point.y >= 615) {
            point.y = Math.round(point.y / 0.01) * 0.01;
            WavelengthPeak.push(point.y + 'nm');
        }
    }


    ctx2.clearRect(0, 0, canvasgraph.width, canvasgraph.height);

    ctx2.beginPath();
    canvasgraph.width = canvas.width;
    ctx2.fillStyle = 'blue';
    ctx2.moveTo(0, 0);
    ctx2.lineTo(0, canvasgraph.height);
    ctx2.lineTo(canvasgraph.width, canvasgraph.height);
    ctx2.lineTo(canvas.width, 615);
    ctx2.stroke();


    ctx2.beginPath();


    dataPoints.forEach(point => {
        // const y = point.y;

        const y = canvasgraph.height - point.y;

        ctx2.lineTo(point.x, point.y);

        ctx2.arc(point.x, y, 0, 0, 0);
    });

    ctx2.strokeStyle = 'blue';

    ctx2.stroke();

    ctx2.fill();

    ctx2.closePath();

}

function downloadSortedWavelengths() {
    const sortedWavelengths = WavelengthPeak.sort((a, b) => parseFloat(b) - parseFloat(a));
    const blob = new Blob([sortedWavelengths.join('\n')], {type: 'text/plain'});

    const a = document.createElement('a');

    if (WavelengthPeak.length === 0) {
        alert('Please analyze an image first!');
        return;
    }

    a.href = URL.createObjectURL(blob);
    a.download = 'Wavelengths.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}