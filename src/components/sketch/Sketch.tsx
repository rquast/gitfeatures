import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from 'react';
import JSZip from 'jszip';
import simplify from 'simplify-js';
import type { SketchElementProps } from '../../types';

interface SketchProps {
  sketchElementProps: SketchElementProps;
}

type Coordinate = {
  x: number;
  y: number;
};

function arrayToArrayBuffer(array: any) {
  const buffer = new ArrayBuffer(array.length * 2);
  const view = new Uint16Array(buffer);
  for (let i = 0; i < array.length; i++) {
    view[i] = array[i];
  }
  return buffer;
}

function gradient(a: number[], b: number[]) {
  return (b[1] - a[1]) / (b[0] - a[0]);
}

/**
 * Adapted from https://www.geeksforgeeks.org/how-to-draw-smooth-curve-through-multiple-points-using-javascript/
 */
function bzCurve(
  line: number[][],
  f: number,
  t: number,
  context: CanvasRenderingContext2D
) {
  if (typeof f == 'undefined') f = 0.3;
  if (typeof t == 'undefined') t = 0.6;

  context.setLineDash([0]);
  context.beginPath();
  context.moveTo(line[0][0], line[0][1]);

  let m = 0;
  let dx1 = 0,
    dx2 = 0;
  let dy1 = 0,
    dy2 = 0;

  let preP = line[0];

  for (let i = 1; i < line.length; i++) {
    const curP = line[i];
    const nexP = line[i + 1];
    if (nexP) {
      m = gradient(preP, nexP);
      dx2 = (nexP[0] - curP[0]) * -f;
      dy2 = dx2 * m * t;
    } else {
      dx2 = 0;
      dy2 = 0;
    }

    context.bezierCurveTo(
      preP[0] - dx1,
      preP[1] - dy1,
      curP[0] + dx2,
      curP[1] + dy2,
      curP[0],
      curP[1]
    );

    dx1 = dx2;
    dy1 = dy2;
    preP = curP;
  }
  context.stroke();
}

/**
 * Based on https://www.ankursheel.com/blog/react-component-draw-page-hooks-typescript
 */
const Sketch = forwardRef(({ sketchElementProps }: SketchProps, ref) => {
  const [isDirty, setIsDirty] = useState<boolean>(false);

  const drawingRef = useRef<any>([]);
  const lineRef = useRef<any>([]);
  const redoRef = useRef<any>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPainting, setIsPainting] = useState(false);
  const [pointerPosition, setPointerPosition] = useState<
    Coordinate | undefined
  >(undefined);

  const [offsets, setOffsets] = useState<{ start: number; end: number }>({
    start: 0,
    end: 0
  });
  const [header, setHeader] = useState<string>('```sketch\n');
  const [markdown, setMarkdown] = useState<string>('');
  const [drawing, setDrawing] = useState<string>('');
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const FOOTER = '\n```';

  useImperativeHandle(ref, () => ({
    undo() {
      if (drawingRef.current.length > 0) {
        redoRef.current.push(drawingRef.current.pop());
        redraw();
      }
    },
    redo() {
      if (redoRef.current.length > 0) {
        drawingRef.current.push(redoRef.current.pop());
        redraw();
      }
    }
  }));

  useEffect(() => {
    setHeader('```' + sketchElementProps.language + '\n');
    setOffsets({
      start: sketchElementProps.sourcePosition.start.offset,
      end: sketchElementProps.sourcePosition.end.offset
    });
    setMarkdown(sketchElementProps.markdown || '');
    setDrawing(sketchElementProps.drawing || '');
    setWidth(sketchElementProps.width || 400);
    setHeight(sketchElementProps.height || 400);
    setIsEditing(sketchElementProps.isEditing);
  }, [
    sketchElementProps,
    sketchElementProps.sourcePosition,
    sketchElementProps.sourcePosition.start,
    sketchElementProps.sourcePosition.end
  ]);

  const startPaint = useCallback(
    (event: PointerEvent) => {
      const coordinates = getCoordinates(event);
      if (coordinates) {
        setPointerPosition(coordinates);
        recordPosition(coordinates);
        setIsPainting(true);
      }
    },
    [isEditing]
  );

  useEffect(() => {
    if (!canvasRef.current || !isEditing) {
      return;
    }
    const canvas: HTMLCanvasElement = canvasRef.current;
    canvas.addEventListener('pointerdown', startPaint, false);
    return () => {
      canvas.removeEventListener('pointerdown', startPaint, false);
      setIsPainting(false);
      lineRef.current = [];
    };
  }, [startPaint]);

  const paint = useCallback(
    (event: PointerEvent) => {
      if (isPainting) {
        const newPointerPosition = getCoordinates(event);
        if (pointerPosition && newPointerPosition) {
          drawLine(pointerPosition, newPointerPosition);
          setPointerPosition(newPointerPosition);
          recordPosition(newPointerPosition);
        }
      }
    },
    [isPainting, pointerPosition]
  );

  useEffect(() => {
    if (!canvasRef.current || !isEditing) {
      return;
    }
    const canvas: HTMLCanvasElement = canvasRef.current;
    canvas.addEventListener('pointermove', paint, false);
    return () => {
      canvas.removeEventListener('pointermove', paint, false);
    };
  }, [paint]);

  const exitPaint = useCallback(
    (event: PointerEvent) => {
      setIsPainting(false);
      setPointerPosition(undefined);
      let newPoints = [];
      for (const point of simplify(lineRef.current, 0.2, true)) {
        newPoints.push([point.x, point.y]);
      }
      drawingRef.current.push(newPoints);
      lineRef.current = [];
      setIsDirty(true);
    },
    [isEditing]
  );

  useEffect(() => {
    if (isDirty) {
      (async () => {
        setIsDirty(false);
        let flat: number[] = [];
        for (const lines of drawingRef.current) {
          if (flat.length > 0) {
            flat = flat.concat([65535]);
          }
          for (const line of lines) {
            flat = flat.concat(line);
          }
        }
        const u8a = new Uint8Array(arrayToArrayBuffer(flat));
        const zip = new JSZip();
        zip.file('lines', u8a);
        // TODO: colors drawingColorsRef.current

        const newDrawing = (
          await zip.generateAsync({ type: 'base64' })
        ).replace(/(.{64})/g, '$1\n');
        const newMarkdown =
          markdown.slice(0, offsets.start) +
          header +
          newDrawing +
          FOOTER +
          markdown.slice(offsets.end);
        sketchElementProps.onChange(newMarkdown);
      })();
    }
  }, [isDirty]);

  useEffect(() => {
    if (!canvasRef.current || !isEditing) {
      return;
    }
    const canvas: HTMLCanvasElement = canvasRef.current;
    canvas.addEventListener('pointerup', exitPaint, false);
    return () => {
      canvas.removeEventListener('pointerup', exitPaint, false);
    };
  }, [exitPaint]);

  useEffect(() => {
    if (!drawing || !canvasRef.current || drawing?.trim().length === 0) {
      return;
    }
    (async () => {
      await unzipDrawing(drawing.replace(/(\r\n|\n|\r)/gm, ''));
    })();
  }, [drawing]);

  const unzipDrawing = async (data: string) => {
    try {
      const zip = await JSZip.loadAsync(data, { base64: true });
      const u8a = await zip.file('lines')?.async('uint8array');
      if (u8a) {
        const u16a = new Uint16Array(u8a.buffer);

        let lines = [];
        let reader: any = [];

        for (let i = 0; i < u16a.length; i++) {
          if (u16a[i] === 65535) {
            lines.push([...reader]);
            reader = [];
          } else {
            reader.push(u16a[i]);
          }
        }
        lines.push([...reader]);

        drawingRef.current = [];
        for (const line of lines) {
          let lineParts = [];
          for (let i = 0; i < line.length; i += 2) {
            lineParts.push([line[i], line[i + 1]]);
          }
          drawingRef.current.push(lineParts);
        }
        redraw();
      }
    } catch (e) {
      // TODO: handle errors better for this - show invalid message in markdown renderer
      console.log(e);
    }
  };

  const redraw = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas?.getContext('2d');
      if (context) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.strokeStyle = '#4299e1';
        context.lineCap = 'round';
        context.lineWidth = 3;
        for (const line of drawingRef.current) {
          bzCurve(line, 0.3, 0.6, context);
        }
      }
    }
  };

  const getCoordinates = (event: PointerEvent): Coordinate | undefined => {
    if (!canvasRef.current) {
      return;
    }

    const canvas: HTMLCanvasElement = canvasRef.current;
    return {
      x: event.pageX - canvas.offsetLeft,
      y: event.pageY - canvas.offsetTop
    };
  };

  const recordPosition = (position: Coordinate) => {
    lineRef.current.push({ x: position.x, y: position.y });
  };

  const drawLine = (
    originalPointerPosition: Coordinate,
    newPointerPosition: Coordinate
  ) => {
    if (!canvasRef.current) {
      return;
    }
    const canvas: HTMLCanvasElement = canvasRef.current;
    const context = canvas.getContext('2d');
    if (context) {
      context.strokeStyle = '#ED8936';
      context.lineJoin = 'round';
      context.lineCap = 'round';
      context.lineWidth = 3;

      context.beginPath();
      context.moveTo(originalPointerPosition.x, originalPointerPosition.y);
      context.lineTo(newPointerPosition.x, newPointerPosition.y);
      context.closePath();

      context.stroke();
    }
  };

  return (
    <canvas
      ref={canvasRef}
      height={height}
      width={width}
      style={{ touchAction: 'none' }}
    />
  );
});

export default Sketch;
