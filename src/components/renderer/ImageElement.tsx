import { HStack, Image, Tag, TagLabel, useColorMode } from '@chakra-ui/react';
import React, { useEffect, useRef, useState } from 'react';
import {
  fetchFileAsBlob,
  isFileInRepository
} from '../../persistence/GitStorage';

const ImageElement = ({
  value,
  repositoryURL
}: {
  value: string;
  repositoryURL: string;
}) => {
  const [element, setElement] = useState<JSX.Element | null>(null);
  const [file, setFile] = useState<string | null>(null);

  const { colorMode } = useColorMode();

  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (value && value.trim().length > 0) {
      if (/light=/.test(value) && /dark=/.test(value)) {
        const parts = value.split(/\r?\n/);
        for (const part of parts) {
          if (part.startsWith(`${colorMode}=`)) {
            const filename = part.split(`=`)[1].trim();
            (async () => {
              if (
                await isFileInRepository(repositoryURL, 'files/' + filename)
              ) {
                setFile(filename);
              } else {
                setFile(null);
              }
            })();
            break;
          }
        }
      } else {
        (async () => {
          if (
            await isFileInRepository(repositoryURL, 'files/' + value.trim())
          ) {
            setFile(value.trim());
          } else {
            setFile(null);
          }
        })();
      }
    } else {
      setFile(null);
    }
  }, [value, colorMode]);

  useEffect(() => {
    if (!file) {
      setElement(
        <HStack>
          <Tag size="lg" variant="outline" colorScheme="red">
            <TagLabel>Image Not Found</TagLabel>
          </Tag>
        </HStack>
      );
    } else {
      setElement(<Image ref={imgRef} alt={file} ignoreFallback={true} />);

      (async () => {
        const fileContent: Blob | null = await fetchFileAsBlob(
          repositoryURL,
          'files/' + file,
          true
        );
        if (fileContent && imgRef.current) {
          imgRef.current.src = URL.createObjectURL(fileContent);
        }
      })();

      const imgRefCopy = imgRef.current;

      return () => {
        if (imgRefCopy) {
          URL.revokeObjectURL(imgRefCopy.src);
        }
      };
    }
  }, [file, imgRef.current]);

  return element;
};

export default ImageElement;
