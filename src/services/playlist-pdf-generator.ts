import { jsPDF, TextOptionsLight } from 'jspdf';
import qrcode from 'qrcode-generator';

import { PlaylistWithTracks, ReducedPlaylistedTrack, ReducedSimplifiedAlbum, ReducedTrack, ReducedTrackItem } from '../types/Spotify';


function generateYearLinePlotData(years: number[]): Record<number, number> {
    return years.reduce<Record<number, number>>((acc, cur) => {
        acc[cur] ??= 0;
        acc[cur] += 1;
        return acc;
    }, {});
}
function generateYearHistogram(years: number[], binSize: number): { [key: string]: number } {
    const histogram: { [key: string]: number } = {};

    years.forEach((year) => {
        // Group years into bins
        const bin = Math.floor(year / binSize) * binSize;
        const binLabel = binSize === 1 ? `${bin}` : `${bin}-${bin + binSize - 1}`;

        if (!histogram[binLabel]) {
            histogram[binLabel] = 0;
        }

        histogram[binLabel]++;
    });

    return histogram;
}

type MarkError = { error: true };
type ExtractionDateType = { printDate: string } & (
    | { year: number; precision: 'year' }
    | { year: number; month: number; precision: 'month' }
    | { year: number; month: number; day: number; precision: 'day' }
);
type ExtractionDateTypeOrError = ExtractionDateType | MarkError;
type ValidPlaylistTrack = ReducedPlaylistedTrack<ReducedTrack> & { extraInfo: { releaseDate: ExtractionDateType } };

const extractReleaseDate = (album: ReducedSimplifiedAlbum): ExtractionDateTypeOrError => {
    const extractYear = (): ExtractionDateTypeOrError => {
        return {
            precision: 'year',
            year: parseInt(album.release_date),
            printDate: album.release_date,
        };
    };

    const extractYearMonth = (parts: string[]): ExtractionDateTypeOrError => {
        const year = parts[0];
        const month = parts[1];
        return {
            precision: 'month',
            year: parseInt(year),
            month: parseInt(month),
            printDate: `${month}.${year}`,
        };
    };

    const extractYearMonthDay = (parts: string[]): ExtractionDateTypeOrError => {
        const year = parts[0];
        const month = parts[1];
        const day = parts[2];
        return {
            precision: 'day',
            year: parseInt(year),
            month: parseInt(month),
            day: parseInt(day),
            printDate: `${day}.${month}.${year}`,
        };
    };
    const returnBasedOnParts = (): ExtractionDateTypeOrError => {
        const parts = album.release_date.split('-');
        if (parts.length === 1) {
            return extractYear();
        } else if (parts.length === 2) {
            return extractYearMonth(parts);
        } else if (parts.length === 3) {
            return extractYearMonthDay(parts);
        }
        return { error: true };
    };
    if (album.release_date_precision === 'year') {
        return extractYear();
    } else if (album.release_date_precision === 'month') {
        return returnBasedOnParts();
    } else if (album.release_date_precision === 'day') {
        return returnBasedOnParts();
    }
    return { error: true };
};

export const calculateInfoAndStats = (playlists: Array<PlaylistWithTracks>) => {
    const allTracksAndEpisodes = playlists.reduce((tracks, playlist) => {
        tracks.push(...playlist.trackInfos.map((trackItem) => trackItem));
        return tracks;
    }, [] as ReducedPlaylistedTrack[]);

    function isTrack(trackItem: ReducedPlaylistedTrack<ReducedTrackItem>): trackItem is ReducedPlaylistedTrack<ReducedTrack> {
        return trackItem.track.type === 'track' || 'album' in trackItem.track;
    }
    const allTracks: ReducedPlaylistedTrack<ReducedTrack>[] = allTracksAndEpisodes.filter(isTrack);
    // function isEpisode(trackItem: ReducedPlaylistedTrack<ReducedTrackItem>): trackItem is ReducedPlaylistedTrack<ReducedEpisode> {
    //     return trackItem.track.type === 'episode' || 'show' in trackItem.track;
    // }
    // const allEpisodes: ReducedPlaylistedTrack<ReducedEpisode>[] = allTracksAndEpisodes.filter(isEpisode);

    const allUniqueTracks = allTracks.reduce<Record<string, ReducedPlaylistedTrack<ReducedTrack>>>((acc, cur) => {
        acc[cur.track.id] = cur;
        return acc;
    }, {});

    const allTrackIds = allTracks.map((t) => t.track.id);
    const totalTracks: number = allTrackIds.length;
    const totalUniqueTrackIds: number = new Set(allTrackIds).size;

    const allValidTracks: Array<ValidPlaylistTrack> = [];

    for (const item of Object.values(allUniqueTracks)) {
        if (item?.track?.album?.release_date?.trim() !== '') {
            const releaseDate = extractReleaseDate(item.track.album);

            if (!('error' in releaseDate)) {
                const track: ValidPlaylistTrack = {
                    ...item,
                    extraInfo: {
                        releaseDate,
                    },
                };
                allValidTracks.push(track);
            }
        }
    }
    const totalValidTracks = allValidTracks.length;

    const validTrackYears = allValidTracks.map((t) => t.extraInfo.releaseDate.year);

    return {
        allValidTracks,
        totalTracks,
        totalUniqueTrackIds,
        totalValidTracks,
        validTrackYears,
    };
};

// const loadImageAsBase64 = (url: string): Promise<string> => {
//     return new Promise((resolve, reject) => {
//         const img = new Image();
//         img.crossOrigin = "Anonymous";
//         img.src = url;
//         img.onload = () => {
//             const canvas = document.createElement("canvas");
//             canvas.width = img.width;
//             canvas.height = img.height;
//             const ctx = canvas.getContext("2d");
//             if (ctx) {
//                 ctx.drawImage(img, 0, 0);
//                 const dataURL = canvas.toDataURL("image/jpeg");
//                 resolve(dataURL);
//             } else {
//                 reject("Failed to get canvas context");
//             }
//         };
//         img.onerror = reject;
//     });
// };

const writeStatisticsPage = async (
    pdf: jsPDF,
    playlists: Array<PlaylistWithTracks>,
    infoAndStats: ReturnType<typeof calculateInfoAndStats>
) => {
    const title = `${import.meta.env.VITE_APP_NAME} - QR Codes`;
    const subtitle = `Generated on ${new Date().toLocaleString('de')}`;

    const { validTrackYears, totalTracks, totalUniqueTrackIds, totalValidTracks } = infoAndStats;

    type PlaylistInfoType = {
        name: string;
        image: string | null;
        tracks: number;
        owner: string;
    };
    const playlistInfos = playlists.map<PlaylistInfoType>((p) => ({
        name: p.name,
        image: p && p.images && p.images.length > 0 ? p.images[0].url : null, // TODO: Just assuming the largest image is first...
        tracks: p.tracks.total,
        owner: p.owner.display_name,
    }));

    const pageWidth = pdf.internal.pageSize.getWidth(); 
    const pageHeight = pdf.internal.pageSize.getHeight();

    const MARGIN_TOP = 10;
    const MARGIN_BOTTOM = 10;
    const MARGIN_LEFT = 20;
    const MARGIN_RIGHT = 20;

    const DEFAULT_FONT_SIZE = 12;
    const DEFAULT_LINE_SPACING = 2;

    let currentY = 0;

    pdf.setFontSize(DEFAULT_FONT_SIZE);

    const addTextRow = (
        text: string,
        options?: { marginLeft?: number; x?: number; fontSize?: number; textOptions?: TextOptionsLight }
    ) => {
        const { marginLeft = 0, x = MARGIN_LEFT, fontSize = DEFAULT_FONT_SIZE, textOptions } = options ?? {};
        currentY += pdf.getTextDimensions(text, { fontSize }).h;
        pdf.setFontSize(fontSize);
        pdf.text(text, x + marginLeft, currentY, textOptions);
        currentY += DEFAULT_LINE_SPACING;
        pdf.setFontSize(DEFAULT_FONT_SIZE);
    };

    const addSpacing = (options?: { height?: number; rows?: number; fontSize?: number }) => {
        const { height, rows, fontSize } = options ?? {};
        currentY += height !== undefined ? height : pdf.getTextDimensions(' ', { fontSize }).h * (rows ? rows : 1);
        addPageIfNeeded();
    };

    const addHorizontalLine = () => {
        pdf.line(
            MARGIN_LEFT,
            currentY - DEFAULT_LINE_SPACING / 2,
            pageWidth - MARGIN_RIGHT,
            currentY - DEFAULT_LINE_SPACING / 2
        );
    };

    const addLinePlot = (options: {
        title: string;
        titleFontSize?: number;
        data: Record<number, number>;
        x?: number;
        y?: number;
        width?: number;
        height?: number;
        lineColor?: string;
        axisFontSize?: number;
        pointRadius?: number;
    }) => {
        const {
            title,
            titleFontSize = DEFAULT_FONT_SIZE,
            data,
            x = MARGIN_LEFT,
            y = currentY,
            width = pageWidth - MARGIN_LEFT - MARGIN_RIGHT,
            height = 50,
            lineColor = 'blue',
            axisFontSize = DEFAULT_FONT_SIZE - 2,
            pointRadius = 1,
        } = options;

        const years = Object.keys(data).map(Number);
        const counts = Object.values(data);
        const maxCount = Math.max(...counts);

        const yAxisTicks = height / 10;
        const yTickSpacing = height / yAxisTicks;
        const yTickValueSpacing = maxCount / yAxisTicks;
        const titleSpacing = 5;
        const xAxisLabelsOffsetY = 8;

        const titleDimensions = pdf.getTextDimensions(title, { fontSize: titleFontSize });
        const yAxisLabelOffset = 10;

        const titleOffsetY = titleDimensions.h + titleSpacing + DEFAULT_LINE_SPACING;

        const potentialHeight = titleOffsetY + height + xAxisLabelsOffsetY;
        addPageIfNeeded({ potentialHeight });

        addTextRow(title, { fontSize: titleFontSize, x: pageWidth / 2, textOptions: { align: 'center' } });
        addSpacing({ height: titleSpacing });

        // Draw Y-Axis labels and horizontal grid lines
        pdf.setFontSize(axisFontSize);
        pdf.setDrawColor(200);
        for (let i = 0; i <= yAxisTicks; i++) {
            const yTickPos = y + titleOffsetY + height - i * yTickSpacing;
            const yTickValue = Math.round(i * yTickValueSpacing);

            pdf.text(`${yTickValue}`, x - yAxisLabelOffset, yTickPos + 2); // Draw Y-axis label
            pdf.line(x, yTickPos, x + width, yTickPos); // Draw horizontal grid line
        }

        // Plot each data point and connect them with lines
        const xSpacing = years.length <= 1 ? width : width / (years.length - 1);
        const yearLabelDimensions = pdf.getTextDimensions('2024', { fontSize: axisFontSize });
        const xAxisLabelStep = xSpacing < yearLabelDimensions.w ? Math.ceil(yearLabelDimensions.w / xSpacing) : 1;

        pdf.setDrawColor(lineColor);
        pdf.setLineWidth(0.5);

        for (let i = 0; i < years.length; i++) {
            const xPos = x + i * xSpacing;
            const yPos = y + titleOffsetY + height - (counts[i] / maxCount) * height;

            // Draw the point
            pdf.setFillColor(lineColor);
            pdf.circle(xPos, yPos, pointRadius, 'F');

            // Connect with a line to the previous point if not the first point
            if (i > 0) {
                const prevX = x + (i - 1) * xSpacing;
                const prevY = y + titleOffsetY + height - (counts[i - 1] / maxCount) * height;
                pdf.line(prevX, prevY, xPos, yPos);
            }

            // Draw year labels on the X-axis at calculated intervals
            if (i === 0 || i % xAxisLabelStep === 0 || i === years.length - 1) {
                pdf.text(
                    `${years[i]}`,
                    xPos - yearLabelDimensions.w / 2,
                    y + titleOffsetY + height + xAxisLabelsOffsetY,
                    { rotationDirection: 0, angle: 30 }
                );
            }
        }
        pdf.setFontSize(DEFAULT_FONT_SIZE);
        pdf.setDrawColor(0);
        pdf.setLineWidth(0.1);

        currentY += potentialHeight;
    };

    const addHistogram = (options: {
        title: string;
        titleFontSize?: number;
        data: Record<string, number>;
        x?: number;
        y?: number;
        width?: number;
        height?: number;
        barColor?: string;
        binFontSize?: number;
    }) => {
        const {
            title,
            titleFontSize = DEFAULT_FONT_SIZE,
            data,
            x = MARGIN_LEFT,
            width = pageWidth - MARGIN_LEFT - MARGIN_RIGHT,
            height = 50,
            barColor = 'blue',
            binFontSize = DEFAULT_FONT_SIZE,
        } = options;

        const keys = Object.keys(data);
        const values = Object.values(data);

        const potentialYearLabelWidth = keys.reduce<number>(
            (acc, cur) => acc + pdf.getTextDimensions(cur, { fontSize: binFontSize }).w,
            0
        );

        const maxValue = Math.max(...values);
        const barWidth = width / keys.length;

        // Draw Y-Axis scale and lines
        const yAxisTicks = 5;
        const tickSpacing = height / yAxisTicks;
        const tickValueSpacing = maxValue / yAxisTicks;

        const titleDim = pdf.getTextDimensions(title, { fontSize: titleFontSize });
        const yearDim = pdf.getTextDimensions('2000', { fontSize: binFontSize });
        const titleSpacing = 5;

        const potentialHeight = titleDim.h + yearDim.h + titleSpacing + height + 5 + DEFAULT_LINE_SPACING;
        addPageIfNeeded({ potentialHeight });

        addTextRow(title, { fontSize: titleFontSize, x: pageWidth / 2, textOptions: { align: 'center' } });

        // Draw Y-Axis labels and horizontal lines
        for (let i = 0; i <= yAxisTicks; i++) {
            const yTickPos = currentY + titleSpacing + height - i * tickSpacing;
            const tickValue = Math.round(i * tickValueSpacing);

            pdf.text(`${tickValue}`, x - 10, yTickPos + 2);
            pdf.setDrawColor(200);
            pdf.line(x, yTickPos, x + width, yTickPos);
        }

        // Draw the bars
        keys.forEach((year, i) => {
            const barHeight = (values[i] / maxValue) * height; 
            const xPos = x + i * barWidth;
            const yPos = currentY + titleSpacing + height - barHeight;

            // Draw the bar
            pdf.setFillColor(barColor);
            pdf.rect(xPos, yPos, barWidth - 1, barHeight, 'F');

            // Add year labels below each bar
            pdf.setFontSize(binFontSize);
            const yearText =
                potentialYearLabelWidth > pageWidth - MARGIN_LEFT - MARGIN_RIGHT ? `${year.substring(2)}` : `${year}`;
            pdf.text(`${yearText}`, xPos + barWidth / 2 - 5, currentY + titleSpacing + height + 5);
            pdf.setFontSize(DEFAULT_FONT_SIZE);
        });

        currentY += potentialHeight;
        pdf.setFontSize(DEFAULT_FONT_SIZE);
    };

    const addPageIfNeeded = (options?: { potentialHeight?: number }) => {
        //at least one pixel should be needed
        const { potentialHeight = 1 } = options ?? {};
        if (currentY + potentialHeight + MARGIN_BOTTOM > pageHeight) {
            pdf.addPage();
            currentY = MARGIN_TOP;
        }
    };

    const addPlaylistInfoCard = (playlist: PlaylistInfoType, options?: { fontSize?: number }) => {
        const { fontSize = DEFAULT_FONT_SIZE } = options ?? {};

        const maxImageWidth = 40;
        const aspectRatioImage = 1;

        const textSize = pdf.getTextDimensions(title, { fontSize });
        const textRows = [`Playlist: ${playlist.name}`, `Owner: ${playlist.owner}`, `Tracks: ${playlist.tracks}`];
        const potentialTextRowsHeight = textRows.length * (textSize.h + DEFAULT_LINE_SPACING);
        const imageHeight = Math.min(potentialTextRowsHeight, maxImageWidth);
        const imageWidth = imageHeight * aspectRatioImage;
        // const imageStartX = pageWidth - MARGIN_RIGHT - imageWidth; //Align right
        const imageStartX = MARGIN_LEFT; //align left

        addPageIfNeeded({ potentialHeight: potentialTextRowsHeight });
        const imageStartY = currentY;

        if (playlist.image) {
            try {
                // const imgData = await loadImageAsBase64(playlist.image);
                const imgData = playlist.image;
                pdf.rect(imageStartX, imageStartY, imageWidth, imageHeight, 'S');
                pdf.addImage(imgData, 'JPEG', imageStartX, imageStartY, imageWidth, imageHeight);
            } catch (error) {
                console.warn(`Failed to load image for playlist: ${playlist.name}`, error);
            }
        }

        for (const text of textRows) {
            addTextRow(text, { fontSize, x: imageStartX + imageWidth + 5 });
        }

        currentY += Math.abs(imageHeight - potentialTextRowsHeight);

        pdf.setFontSize(DEFAULT_FONT_SIZE);
    };

    const addStatRows = <Item extends { label: string; value: string; description: string }>(
        stats: Array<Item>,
        options?: { x?: number; fontSize?: number }
    ) => {
        const { fontSize = DEFAULT_FONT_SIZE, x = MARGIN_LEFT } = options ?? {};

        const maxStatCalc = (prop: keyof Item) =>
            Math.max(...stats.map((stat) => pdf.getTextDimensions(stat[prop] as string).w, { fontSize })); //TODO: as cast isnt good
        const maxLabelDimensionWidth = maxStatCalc('label');
        const maxValueWidth = maxStatCalc('value');
        const getSeperatorWithDimensions = (sep: string) => ({
            value: sep,
            dimensions: pdf.getTextDimensions(sep, { fontSize }),
        });

        pdf.setFontSize(fontSize);

        for (const { label, value, description } of stats) {
            currentY += pdf.getTextDimensions(label, { fontSize }).h;
            const labelValueSep = getSeperatorWithDimensions(' : ');
            const valueDescSep = getSeperatorWithDimensions('  -  ');

            pdf.text(label, x, currentY);
            pdf.text(`${labelValueSep.value}`, x + maxLabelDimensionWidth, currentY);
            pdf.text(`${value}`, x + maxLabelDimensionWidth + labelValueSep.dimensions.w + maxValueWidth, currentY, {
                align: 'right',
            });
            pdf.text(
                `${valueDescSep.value}${description}`,
                x + maxLabelDimensionWidth + maxValueWidth + labelValueSep.dimensions.w + valueDescSep.dimensions.w,
                currentY
            );

            currentY += DEFAULT_LINE_SPACING;
        }
        pdf.setFontSize(DEFAULT_FONT_SIZE);
    };

    addTextRow(title, { x: pageWidth / 2, fontSize: 22, textOptions: { align: 'center' } });
    addTextRow(subtitle, { x: pageWidth / 2, fontSize: 14, textOptions: { align: 'center' } });
    addTextRow('Statistics');
    addHorizontalLine();
    addStatRows([
        { label: 'Total tracks', value: `${totalTracks}`, description: 'Amount of tracks in all selected playlists.' },
        {
            label: 'Unique tracks',
            value: `${totalUniqueTrackIds}`,
            description: 'Removed duplicate tracks when combining playlists.',
        },
        { label: 'Valid tracks', value: `${totalValidTracks}`, description: 'Tracks which have a release date!' },
    ]);
    addSpacing();
    const histogramData = generateYearHistogram(validTrackYears, 1);
    if (Object.keys(histogramData).length < 1) {
        addHistogram({ title: 'Year distribution', data: histogramData, binFontSize: 10 });
    } else {
        addLinePlot({ title: 'Year distribution', data: generateYearLinePlotData(validTrackYears) });
    }
    addTextRow('Playlist Information', { x: pageWidth / 2, fontSize: 14, textOptions: { align: 'center' } });
    for (const playlist of playlistInfos) {
        addSpacing();
        addPlaylistInfoCard(playlist);
    }
};

export interface ProgressUpdate {
    section: string;
    progress: number;
}
export async function generatePdfSimulation(
    _playlists: Array<PlaylistWithTracks>,
    onProgress: (progressUpdate: ProgressUpdate) => void
): Promise<jsPDF> {
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
    });

    for (let i = 0; i < 1000; i++) {
        onProgress({ section: 'Test 1', progress: i / 10 });
        await new Promise((resolve) => setTimeout(resolve, 5));
    }

    for (let i = 0; i < 1000; i++) {
        onProgress({ section: 'Testsection 2', progress: i / 10 });
        await new Promise((resolve) => setTimeout(resolve, 2));
    }

    return pdf;
}
export async function generatePdf(
    playlists: Array<PlaylistWithTracks>,
    onProgress: (progressUpdate: ProgressUpdate) => Promise<void>
): Promise<jsPDF> {
    const hackyProgressUpdate = async (progressUpdate: ProgressUpdate) => {
        await onProgress(progressUpdate);
        // Yield control to the main thread to allow React to update
        await new Promise((resolve) => setTimeout(resolve, 0));
    };
    const sectionCalcStatsStr = 'Calculating stats and creating empty pdf...';
    await hackyProgressUpdate({ section: sectionCalcStatsStr, progress: 0 });

    const infoAndStats = calculateInfoAndStats(playlists);

    // // Initialize jsPDF for A4 paper (210mm x 297mm)
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
    });

    writeStatisticsPage(pdf, playlists, infoAndStats);
    pdf.addPage();
    await hackyProgressUpdate({ section: sectionCalcStatsStr, progress: 100 });

    const sectionAddingQrCodes = 'Adding QR codes to pdf...';
    await hackyProgressUpdate({ section: sectionAddingQrCodes, progress: 0 });

    const progressUpdatePerQrCodes = Math.floor(infoAndStats.allValidTracks.length / 100);

    const pageWidth = pdf.internal.pageSize.getWidth(); 
    const pageHeight = pdf.internal.pageSize.getHeight();
    const qrPerRow = 4; 
    const qrPerColumn = 5;
    const qrSize = 40; // Size of each QR code (in mm)
    const spacingLeftRight = (pageWidth - qrPerRow * qrSize) / qrPerRow;
    const marginLeftRight = spacingLeftRight / 2;
    const spacingTopBottom = (pageHeight - qrPerColumn * qrSize) / qrPerColumn;
    const marginTopBottom = spacingTopBottom / 2;

    const drawScisscorLines = () => {
        pdf.setDrawColor(200);
        pdf.setLineWidth(0.05);
        pdf.setLineDashPattern([5, 5], 1);
        for (let i = 1; i < qrPerRow; i++) {
            const x = i * (qrSize + spacingLeftRight);
            pdf.line(x, 0, x, pageHeight);
        }

        for (let i = 1; i < qrPerColumn; i++) {
            const y = i * (qrSize + spacingTopBottom);
            pdf.line(0, y, pageWidth, y);
        }
        pdf.setLineDashPattern([], 0);
        pdf.setDrawColor(0);
        pdf.setLineWidth(0.1);
    };
    let xPos = marginLeftRight;
    let yPos = marginTopBottom;

    drawScisscorLines();
    for (let qrCount = 0; qrCount <= infoAndStats.allValidTracks.length; qrCount++) {
        // Move to the next row if we've placed enough QR codes on this row
        if (qrCount !== 0 && qrCount % qrPerRow === 0) {
            xPos = marginLeftRight; // Reset to the left margin
            yPos += qrSize + spacingTopBottom; // Move down to the next row
        }
        // Check if we need to add a new page (i.e., if we're out of space)
        const isLastRow = qrCount !== 0 && qrCount % Math.min((qrPerColumn * qrPerRow), infoAndStats.allValidTracks.length) === 0;

        if (isLastRow || qrCount === infoAndStats.allValidTracks.length) {
            pdf.addPage();
            drawScisscorLines();

            const oldFontSize = pdf.getFontSize();
            const oldFont = pdf.getFont();
            const marginBacksideTopBottom = 5;
            const marginBacksideLeftRight = 1;
            const availableWidth = pageWidth / qrPerRow - 2 * marginBacksideLeftRight;
            const yearFontSize = 24;
            const yearExactlyFontSize = 10;
            const songNameFontSize = 12;
            const artistsFontSize = 12;
            const qrCodesOnCurrentPage =
                qrCount % (qrPerColumn * qrPerRow) === 0 ? qrPerColumn * qrPerRow : qrCount % (qrPerColumn * qrPerRow);
            for (let i = 0; i < qrCodesOnCurrentPage; i++) {
                // row/col to
                // 3 2 1 0
                // 7 6 5 4
                // . . .
                const row = Math.floor(i / qrPerRow);
                const col = (qrPerRow-1) - (i % qrPerRow);
                const idx = qrCount - qrCodesOnCurrentPage + i;
                const backsideTrack = infoAndStats.allValidTracks[idx];

                const yearDim = pdf.getTextDimensions(`${backsideTrack.extraInfo.releaseDate.year}`, {
                    fontSize: yearFontSize,
                });

                const artists = backsideTrack.track.artists.map((a) => a.name).join(', ');
                const artistsRows = pdf.splitTextToSize(artists, availableWidth, {
                    fontSize: artistsFontSize,
                }) as string[];
                pdf.setFontSize(yearExactlyFontSize);
                pdf.setFont(oldFont.fontName, 'bold');
                pdf.text(
                    artistsRows,
                    (col + 0.5) * (qrSize + spacingLeftRight),
                    row * (qrSize + spacingTopBottom) + marginBacksideTopBottom,
                    { align: 'center', maxWidth: qrSize + spacingLeftRight }
                );

                const songName = backsideTrack.track.name;
                const songNameRows = pdf.splitTextToSize(songName, availableWidth, {
                    fontSize: songNameFontSize,
                }) as string[];
                pdf.setFontSize(yearExactlyFontSize);
                pdf.setFont(oldFont.fontName, 'italic');
                pdf.text(
                    songNameRows,
                    (col + 0.5) * (qrSize + spacingLeftRight),
                    (row + 0.75) * (qrSize + spacingTopBottom),
                    { align: 'center', maxWidth: qrSize + spacingLeftRight }
                );

                pdf.setFontSize(yearExactlyFontSize);
                pdf.setFont(oldFont.fontName, 'normal');
                pdf.text(
                    backsideTrack.extraInfo.releaseDate.printDate,
                    (col + 0.5) * (qrSize + spacingLeftRight),
                    (row + 0.5) * (qrSize + spacingTopBottom) + yearDim.h / 2,
                    { align: 'center', maxWidth: qrSize + spacingLeftRight }
                );

                pdf.setFontSize(yearFontSize);
                pdf.setFont(oldFont.fontName, 'bold');
                pdf.text(
                    `${backsideTrack.extraInfo.releaseDate.year}`,
                    (col + 0.5) * (qrSize + spacingLeftRight),
                    (row + 0.5) * (qrSize + spacingTopBottom),
                    { align: 'center', maxWidth: qrSize + spacingLeftRight }
                );
            }
            pdf.setFontSize(oldFontSize);
            pdf.setFont(oldFont.fontName, oldFont.fontStyle);
            if (qrCount === infoAndStats.allValidTracks.length) {
                break;
            }
        }

        if (isLastRow) {
            pdf.addPage();
            drawScisscorLines();
            xPos = marginLeftRight;
            yPos = marginTopBottom;
        }
        const trackItemWithExtraInfo = infoAndStats.allValidTracks[qrCount];
        const qrCodeData = trackItemWithExtraInfo.track.uri;

        // Generate QR code as a canvas
        const qr = qrcode(0, 'L');
        qr.addData(qrCodeData);
        qr.make();

        // // const svgImg = qr.createSvgTag(10,4);
        // // await pdf.addSvgAsImage(svgImg, xPos, yPos, qrSize, qrSize)
        const qrImg = qr.createDataURL(10, 4); //TODO Improvement potential here!
        pdf.addImage(qrImg, 'GIF87a', xPos, yPos, qrSize, qrSize);

        if (qrCount % progressUpdatePerQrCodes === 0) {
            await hackyProgressUpdate({
                section: sectionAddingQrCodes,
                progress: Math.ceil(100 * (qrCount / infoAndStats.allValidTracks.length)),
            });
        }
        xPos += qrSize + spacingLeftRight;
    }
    await hackyProgressUpdate({ section: sectionAddingQrCodes, progress: 100 });

    return Promise.resolve(pdf);
}
