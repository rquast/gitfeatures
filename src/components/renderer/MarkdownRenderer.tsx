import React from 'react';
import {
  Text,
  Code,
  Divider,
  Link,
  List,
  Checkbox,
  ListItem,
  Heading,
  Image,
  Button,
  HStack
} from '@chakra-ui/react';
import { DownloadIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { fetchFileAsBlob } from '../../persistence/GitStorage';
import MermaidElement from './MermaidElement';
import SketchElement from './SketchElement';
import ImageElement from './ImageElement';

interface MarkdownRendererProps {
  currentRepositoryURL: string;
  value: string;
  onChange: any;
  isEditing: boolean;
}

let markdownRendererProps: MarkdownRendererProps;

function getCoreProps(props: { [x: string]: any }) {
  return props['data-sourcepos']
    ? { 'data-sourcepos': props['data-sourcepos'] }
    : {};
}

const onDownloadFile = async (file: string) => {
  const fileContent: Blob | null = await fetchFileAsBlob(
    markdownRendererProps.currentRepositoryURL,
    'files/' + file
  );
  if (fileContent) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(fileContent);
    link.setAttribute('download', file);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
  }
};

export const theme = {
  paragraph: (props: any) => {
    const { children } = props;
    return <Text mb={6}>{children}</Text>;
  },
  emphasis: (props: any) => {
    const { children } = props;
    return <Text as="em">{children}</Text>;
  },
  blockquote: (props: any) => {
    const { children } = props;
    return <Code p={2}>{children}</Code>;
  },
  code: (props: any) => {
    const { language, value } = props;
    if (language === 'file') {
      if (value) {
        const files = value.split(/\r?\n/);
        return (
          <HStack wrap="wrap" mb={4}>
            {files.map((file: string) => (
              <Button
                key={file}
                onClick={() => onDownloadFile(value)}
                leftIcon={<DownloadIcon />}
              >
                {file}
              </Button>
            ))}
          </HStack>
        );
      } else {
        return <></>;
      }
    } else if (language === 'image') {
      return (
        <HStack>
          <ImageElement
            value={value}
            repositoryURL={markdownRendererProps.currentRepositoryURL}
          />
        </HStack>
      );
    } else if (language && language.startsWith('sketch')) {
      const regex = /\[(.*?)\]/;
      const parts = regex.exec(language);
      if (parts && parts.length > 1) {
        const dimensionParts = parts[1].toLowerCase().split('x');
        if (dimensionParts.length === 2) {
          let width = Number(dimensionParts[0]);
          if (width < 50 || width >= 65535) {
            width = 400;
          }
          let height = Number(dimensionParts[1]);
          if (height < 50 || height >= 65535) {
            height = 400;
          }
          return (
            <SketchElement
              markdown={markdownRendererProps.value}
              drawing={props.value}
              language={language}
              width={width}
              height={height}
              sourcePosition={props.sourcePosition}
              onChange={markdownRendererProps.onChange}
              isEditing={markdownRendererProps.isEditing}
            />
          );
        }
      }
      return (
        <SketchElement
          markdown={markdownRendererProps.value}
          width={400}
          height={400}
          drawing={props.value}
          language={language}
          sourcePosition={props.sourcePosition}
          onChange={markdownRendererProps.onChange}
          isEditing={markdownRendererProps.isEditing}
        />
      );
    } else if (language === 'mermaid') {
      return <MermaidElement value={value} />;
    } else {
      const className = language && `language-${language}`;
      return (
        <pre {...getCoreProps(props)}>
          <Code p={2} className={className || undefined}>
            {value}
          </Code>
        </pre>
      );
    }
  },
  delete: (props: any) => {
    const { children } = props;
    return <Text as="del">{children}</Text>;
  },
  thematicBreak: Divider,
  link: (props: any) => {
    return (
      <Link {...getCoreProps(props)} href={props.href} isExternal>
        {props.children} <ExternalLinkIcon mx="2px" />
      </Link>
    );
  },
  img: Image,
  linkReference: Link,
  imageReference: Image,
  text: (props: any) => {
    const { children } = props;
    return (
      <Text as="span" whiteSpace="pre-wrap">
        {children}
      </Text>
    );
  },
  list: (props: any) => {
    const { start, ordered, children, depth } = props;
    const attrs = getCoreProps(props);
    if (start !== null && start !== 1 && start !== undefined) {
      // @ts-ignore
      attrs.start = start.toString();
    }
    let styleType = 'disc';
    if (ordered) styleType = 'decimal';
    if (depth === 1) styleType = 'circle';
    return (
      <List
        spacing={1}
        as={ordered ? 'ol' : 'ul'}
        styleType={styleType}
        pl={4}
        {...attrs}
        mb={4}
      >
        {children}
      </List>
    );
  },
  listItem: (props: any) => {
    const { children, checked } = props;
    let checkbox = null;
    if (checked !== null && checked !== undefined) {
      checkbox = (
        <Checkbox isChecked={checked} isReadOnly>
          {children}
        </Checkbox>
      );
    }
    return (
      <ListItem
        {...getCoreProps(props)}
        listStyleType={checked !== null ? 'none' : 'inherit'}
      >
        {checkbox || children}
      </ListItem>
    );
  },
  definition: () => null,
  heading: (props: any) => {
    const { level, children }: { level: number; children: any } = props;
    const sizes: string[] = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs'];
    const asElement: any = `h${level}`;
    return (
      <Heading
        my={4}
        as={asElement}
        size={sizes[level]}
        {...getCoreProps(props)}
      >
        {children}
      </Heading>
    );
  },
  inlineCode: (props: any) => {
    const { children } = props;
    return <Code {...getCoreProps(props)}>{children}</Code>;
  }
};

function MarkdownRenderer(props: MarkdownRendererProps) {
  markdownRendererProps = props;
  return {
    paragraph: theme.paragraph,
    emphasis: theme.emphasis,
    blockquote: theme.blockquote,
    code: theme.code,
    delete: theme.delete,
    thematicBreak: theme.thematicBreak,
    link: theme.link,
    img: theme.img,
    linkReference: theme.linkReference,
    imageReference: theme.imageReference,
    text: theme.text,
    list: theme.list,
    listItem: theme.listItem,
    definition: theme.definition,
    heading: theme.heading,
    inlineCode: theme.inlineCode
  };
}

export default MarkdownRenderer;
