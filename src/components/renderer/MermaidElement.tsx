import { HStack, Tag, TagLabel, useColorMode } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
//@ts-ignore
import * as mermaid from 'mermaid/dist/mermaid.min';
import parse from 'html-react-parser';
import { customAlphabet } from 'nanoid';

mermaid.initialize({
  startOnLoad: false,
  themeVariables: {
    fontFamily: 'Inter',
    fontSize: '15px'
  },
  er: {
    minEntityWidth: 150,
    minEntityHeight: 55,
    entityPadding: 25
  },
  sequence: {
    width: 130,
    height: 30
  },
  gantt: {
    barHeight: 45,
    barGap: 4,
    fontSize: 17,
    fontFamily: 'Inter'
  }
} as any);

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz', 20);

const MermaidElement = ({ value }: { value: string }) => {
  const [svgCode, setSvgCode] = useState<string | undefined>(undefined);
  const [element, setElement]: [any, any] = useState<Element | null>(null);

  const { colorMode } = useColorMode();

  useEffect(() => {
    if (value) {
      let init: {} = {
        theme: colorMode === 'dark' ? 'dark' : 'neutral'
      };

      const valueTheme: string = `%%{init: ${JSON.stringify(
        init
      )}}%%\n${value}`;

      try {
        if (mermaid.parse(valueTheme)) {
          (async () => {
            setSvgCode(
              await new Promise((resolve) => {
                mermaid.render(nanoid(), valueTheme, (data: string) => {
                  resolve(data);
                });
              })
            );
          })();
        }
      } catch (e) {}
    }
    setSvgCode(undefined);
  }, [value, colorMode]);

  useEffect(() => {
    if (svgCode) {
      setElement(
        <>
          {colorMode === 'dark' ? (
            <HStack
              css={{
                '.messageText': {
                  stroke: 'none !important',
                  fontSize: '0.9rem !important'
                },
                '* .attributeBoxEven': {
                  fill: 'rgb(45, 55, 72) !important'
                },
                '* .attributeBoxOdd': {
                  fill: 'rgb(74, 85, 104) !important'
                }
              }}
            >
              {parse(svgCode)}
            </HStack>
          ) : (
            <HStack
              css={{
                '.messageText': {
                  stroke: 'none !important',
                  fontSize: '0.9rem !important'
                }
              }}
            >
              {parse(svgCode)}
            </HStack>
          )}
        </>
      );
    } else {
      setElement(
        <HStack>
          <Tag size="lg" variant="outline" colorScheme="red">
            <TagLabel>Invalid Mermaid Syntax</TagLabel>
          </Tag>
        </HStack>
      );
    }
  }, [svgCode]);

  return element;
};

export default MermaidElement;
