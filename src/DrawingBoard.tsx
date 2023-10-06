import React, { useState, useRef } from 'react';
import { Stage, Layer, Rect, Circle, Ellipse, Text } from 'react-konva';
import './DrawingBoard.css'

type BaseShape = {
  x: number;
  y: number;
  fill: string;
};

type RectangleShape = BaseShape & {
  type: 'rectangle';
  width: number;
  height: number;
};

type CircleShape = BaseShape & {
  type: 'circle';
  radius: number;
};

type EllipseShape = BaseShape & {
  type: 'ellipse';
  radiusX: number;
  radiusY: number;
};

type TextShape = BaseShape & {
  type: 'text';
  text: string;
  fontSize: number;
};

type TextBlock = {
  text: string;
};

type Shape = RectangleShape | CircleShape | EllipseShape | TextShape;

const DrawingBoard: React.FC = () => {
  const [selectedShape, setSelectedShape] = useState<Shape['type']>('rectangle');
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [selectedShapeIndex, setSelectedShapeIndex] = useState<number | null>(null);
  const [selectedShapeSize, setSelectedShapeSize] = useState<number>(0);
  const [isEditingText, setIsEditingText] = useState<boolean>(false);
  const [editedText, setEditedText] = useState<string>('');
  const [textBlocks, setTextBlocks] = useState<TextBlock[]>([]);
  const [selectedTextBlockIndex, setSelectedTextBlockIndex] = useState<number | null>(null);


  const stageRef = useRef<any>(null);

  const handleShapeChange: React.ChangeEventHandler<HTMLSelectElement> = (event) => {
    setSelectedShape(event.target.value as Shape['type']);
  };

  const handleShapeResize = (index: number, newSize: number) => {
    setShapes((prevShapes) => {
      const updatedShapes = [...prevShapes];
      const selectedShape = updatedShapes[index];

      if (selectedShape.type === 'rectangle') {
        const rectangle = selectedShape as RectangleShape;
        rectangle.width = newSize;
        rectangle.height = newSize;
      } else if (selectedShape.type === 'circle') {
        const circle = selectedShape as CircleShape;
        circle.radius = newSize / 2;
      } else if (selectedShape.type === 'ellipse') {
        const ellipse = selectedShape as EllipseShape;
        ellipse.radiusX = newSize / 2;
        ellipse.radiusY = newSize / 2;
      }

      return updatedShapes;
    });
  };

  const addShape = (selectedShapeType: Shape['type']) => {
    let newShape: Shape;

    switch (selectedShapeType) {
      case 'rectangle':
        newShape = {type: 'rectangle',x: 10,y: 10,width: 100,height: 100,fill: 'blue'};
        break;
      case 'circle':
        newShape = {type: 'circle',x: 50,y: 50,radius: 50,fill: 'green'};
        break;
      case 'ellipse':
        newShape = {type: 'ellipse',x: 75,y: 75,radiusX: 75,radiusY: 50,fill: 'red'};
        break;
      case 'text':
        newShape = {type: 'text',x: 100,y: 100,text: 'Hello, World!',fontSize: 20,fill: 'black',};
        break;
      default:
        return;
    }

    setShapes([...shapes, newShape]);
  };

  const handleTextDoubleClick = (index: number, initialText: string) => {
    const newText = window.prompt('Enter new text:', initialText);
    if (newText !== null) {
      setShapes((prevShapes) => {
        const updatedShapes = [...prevShapes];
        const selectedShape = updatedShapes[index];
        if (selectedShape.type === 'text') {
          const textBlock = selectedShape as TextShape;
          textBlock.text = newText;
        }
        return updatedShapes;
      });
    }
  };

  const handleTextSubmit = () => {
    if (selectedTextBlockIndex !== null) {
      setTextBlocks((prevBlocks) => {
        const newBlocks = [...prevBlocks];
        newBlocks[selectedTextBlockIndex] = { text: editedText };
        return newBlocks;
      });
    }
    setIsEditingText(false);
  };
  
  const handleTextClick = (index: number) => {
    setSelectedTextBlockIndex(index);
    setEditedText(textBlocks[index].text);
    setIsEditingText(true);
  };

  return (
    <div className="drawing-board">
      <button onClick={() => addShape(selectedShape)}>Add Shape</button>
      <select value={selectedShape} onChange={handleShapeChange}>
        <option value="rectangle">Rectangle</option>
        <option value="circle">Circle</option>
        <option value="ellipse">Ellipse</option>
        <option value="line">Line</option>
        <option value="text">Text</option>
      </select>
      {selectedShapeIndex !== null && (
        <div className="size-input">
          Size:
          <input
            type="number"
            value={selectedShapeSize}
            onChange={(e) => {
              const newSize = parseInt(e.target.value);
              if (!isNaN(newSize)) {
                handleShapeResize(selectedShapeIndex, newSize);
                setSelectedShapeSize(newSize);
              }
            }}
          />
        </div>
      )}
      <Stage width={1400} height={1400} ref={stageRef}>
        <Layer>
          {shapes.map((shape, index) => {
            if (shape.type === 'rectangle') {
              const rectangle = shape as RectangleShape;
              return (
                <Rect
                  key={index}
                  x={rectangle.x}
                  y={rectangle.y}
                  width={rectangle.width}
                  height={rectangle.height}
                  fill={rectangle.fill}
                  draggable
                  onDragEnd={(e) => {
                    const newShapes = [...shapes];
                    newShapes[index] = {
                      ...rectangle,
                      x: e.target.x(),
                      y: e.target.y(),
                    };
                    setShapes(newShapes);
                  }}
                  onTransform={(e) => {
                    const node = e.target;
                    const scaleX = node.scaleX();
                    const scaleY = node.scaleY();

                    const updatedRectangle = {
                      ...rectangle,
                      width: rectangle.width * scaleX,
                      height: rectangle.height * scaleY,
                    };

                    const newShapes = [...shapes];
                    newShapes[index] = updatedRectangle;

                    setShapes(newShapes);
                  }}
                  onClick={() => {
                    setSelectedShapeIndex(index);
                    setSelectedShapeSize(rectangle.width);
                  }}
                />
              );
            } else if (shape.type === 'circle') {
              const circle = shape as CircleShape;
              return (
                <Circle
                  key={index}
                  x={circle.x}
                  y={circle.y}
                  radius={circle.radius}
                  fill={circle.fill}
                  draggable
                  onDragEnd={(e) => {
                    const newShapes = [...shapes];
                    newShapes[index] = {
                      ...circle,
                      x: e.target.x(),
                      y: e.target.y(),
                    };
                    setShapes(newShapes);
                  }}
                  onTransform={(e) => {
                    const node = e.target;
                    const scaleX = node.scaleX();
                    const scaleY = node.scaleY();

                    const updatedCircle = {
                      ...circle,
                      radius: circle.radius * scaleX,
                      x: e.target.x(),
                      y: e.target.y(),
                    };

                    const newShapes = [...shapes];
                    newShapes[index] = updatedCircle;

                    setShapes(newShapes);
                  }}
                  onClick={() => {
                    setSelectedShapeIndex(index);
                    setSelectedShapeSize(circle.radius * 2);
                  }}
                />
              );
            } else if (shape.type === 'ellipse') {
              const ellipse = shape as EllipseShape;
              return (
                <Ellipse
                  key={index}
                  x={ellipse.x}
                  y={ellipse.y}
                  radiusX={ellipse.radiusX}
                  radiusY={ellipse.radiusY}
                  fill={ellipse.fill}
                  draggable
                  onDragEnd={(e) => {
                    const newShapes = [...shapes];
                    newShapes[index] = {
                      ...ellipse,
                      x: e.target.x(),
                      y: e.target.y(),
                    };
                    setShapes(newShapes);
                  }}
                  onTransform={(e) => {
                    const node = e.target;
                    const scaleX = node.scaleX();
                    const scaleY = node.scaleY();

                    const updatedEllipse = {
                      ...ellipse,
                      radiusX: ellipse.radiusX * scaleX,
                      radiusY: ellipse.radiusY * scaleY,
                      x: e.target.x(),
                      y: e.target.y(),
                    };

                    const newShapes = [...shapes];
                    newShapes[index] = updatedEllipse;

                    setShapes(newShapes);
                  }}
                  onClick={() => {
                    setSelectedShapeIndex(index);
                    setSelectedShapeSize(ellipse.radiusX * 2);
                  }}
                />
              );
            } else if (shape.type === 'text') {
              const textBlock = shape as TextShape;
              return (
                <Text
                  key={index}
                  x={textBlock.x}
                  y={textBlock.y}
                  text={textBlock.text}
                  fontSize={textBlock.fontSize}
                  fill={textBlock.fill}
                  draggable
                  onDragEnd={(e) => {
                    const newShapes = [...shapes];
                    newShapes[index] = {
                      ...textBlock,
                      x: e.target.x(),
                      y: e.target.y(),
                    };
                    setShapes(newShapes);
                  }}
                  onDblClick={() => handleTextDoubleClick(index, textBlock.text)}
                />
              );
            }
            return null;
          })}
        </Layer>
      </Stage>
      <div className="drawing-tools"> 
        <button onClick={() => setSelectedShape('rectangle')}>Rectangle</button>
        <button onClick={() => setSelectedShape('circle')}>Circle</button>
        <button onClick={() => setSelectedShape('ellipse')}>Ellipse</button>
        <button onClick={() => setSelectedShape('text')}>Text</button> 
      </div>
      {isEditingText && (
        <div className="text-input"> 
          Text:
          <input
            type="text"
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            onBlur={handleTextSubmit}
            autoFocus
          />
        </div>
      )}
      {textBlocks.map((block, index) => (
        <div
          key={index}
          className={`text-block${index === selectedTextBlockIndex ? ' active' : ''}`}
          onClick={() => handleTextClick(index)}
        >
          {block.text}
        </div>
      ))}
    </div>
  );
};

export default DrawingBoard;
