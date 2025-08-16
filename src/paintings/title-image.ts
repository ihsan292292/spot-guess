export type ArtworkImage = {
    imageDataUrl: string;
    dimensionsString: string;
    imageMimeType: string;
}

export const createArtworkTitleImage = (opts?: {size?: number}): ArtworkImage => {
    const {
        size = 512
    } = opts ?? {};

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const destroyCanvas = () => {
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
        canvas.width = 0;
        canvas.height = 0;
    }

    if (ctx) {
        const drawBackground = () => {
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        const drawNeon = (ctx: CanvasRenderingContext2D, r: number,g: number,b: number, drawFn: () => void) => {
            const minSize = Math.min(ctx.canvas.width, ctx.canvas.height)
            const iterations = 8;
            ctx.shadowColor = `rgb(${r},${g},${b})`;
            ctx.strokeStyle= `rgba(${r},${g},${b},${1/iterations})`;
            ctx.shadowBlur=minSize*0.05;

            for(let i = iterations; i>=0; i--){
                ctx.lineWidth=Math.pow(1.4, i)*(minSize*0.01);
                drawFn();
            }

            ctx.strokeStyle= '#fff';
            ctx.lineWidth=minSize*0.009;
            drawFn();
        }

        const drawRectangle = function(x: number, y: number, w: number, h: number, border: number){
            ctx.beginPath();
            ctx.moveTo(x+border, y);
            ctx.lineTo(x+w-border, y);
            ctx.quadraticCurveTo(x+w-border, y, x+w, y+border);
            ctx.lineTo(x+w, y+h-border);
            ctx.quadraticCurveTo(x+w, y+h-border, x+w-border, y+h);
            ctx.lineTo(x+border, y+h);
            ctx.quadraticCurveTo(x+border, y+h, x, y+h-border);
            ctx.lineTo(x, y+border);
            ctx.quadraticCurveTo(x, y+border, x+border, y);
            ctx.closePath();
            ctx.stroke();
        }

        const drawNeonBorder = function(ctx: CanvasRenderingContext2D, x: number,y: number,w: number,h: number,r: number,g: number,b: number){
            drawNeon(ctx,r,g,b, () => drawRectangle(x,y,w,h,3));
        };

        const drawNote = function(ctx: CanvasRenderingContext2D, x: number,y: number){
            const width = ctx.canvas.width;
            const height = ctx.canvas.height;

            const beamHeight = height*0.4;
            const beamWidth = width*0.4;
            const beamSteep = height*0.1;
            const radius = width*0.1;

            const offsetY = (beamHeight)/2
            const offsetX = -(beamWidth+radius/2)/2

            ctx.beginPath();
            ctx.arc(x+offsetX, y+offsetY, radius, 0, Math.PI * 2);
            ctx.moveTo(x + radius+offsetX, y+offsetY);
            ctx.lineTo(x + radius+offsetX, y - beamHeight +offsetY);
            ctx.lineTo(x + radius+beamWidth+offsetX, y - beamHeight - beamSteep+offsetY);
            ctx.lineTo(x + radius+beamWidth+offsetX, y - beamSteep+offsetY);
            ctx.arc(x+beamWidth+offsetX, y-beamSteep+offsetY, radius, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        const drawNeonNote = function(ctx: CanvasRenderingContext2D, x: number,y: number,r: number,g: number,b: number){
            drawNeon(ctx,r,g,b, () => drawNote(ctx, x,y));
        }

        drawBackground();
        drawNeonBorder(ctx, 0, 0, canvas.width, canvas.height, 0, 88, 255)
        drawNeonNote(ctx, canvas.width/2, canvas.height/2, 255, 2, 0)
    }

    const imageMimeType = 'image/png';
    const imageDataUrl = canvas.toDataURL(imageMimeType);
    destroyCanvas();

    return {
        imageDataUrl,
        dimensionsString: `${size}x${size}`,
        imageMimeType
    }
};