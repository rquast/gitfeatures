import React from 'react';
import { Flex, Link } from '@chakra-ui/react';
import TreeNodeTitleInput from '../input/TreeNodeTitleInput';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import useTree from '../../hooks/useTree';
import TagsView from '../view/TagsView';
import DocumentView from '../view/DocumentView';
import ExampleMapView from '../view/ExampleMapView';
import FeatureView from '../view/FeatureView';

function ResponsiveContent() {
  const { currentSpecNode } = useTree();

  return (
    <>
      <Flex justifyContent="flex-end" direction="row" p={4}>
        <Link href="https://gitfeatures.com" isExternal fontSize="xs">
          GitFeatures: an open source specification tool (MIT license)
          <ExternalLinkIcon mx="2px" />
        </Link>
      </Flex>
      <Flex>
        <TreeNodeTitleInput type="spec" />
        <Flex minWidth={230} />
      </Flex>
      <TagsView />
      {currentSpecNode?.type === 'folder' ? (
        <DocumentView />
      ) : currentSpecNode?.type === 'map' ? (
        <ExampleMapView />
      ) : (
        <FeatureView />
      )}
    </>
  );
}

export default ResponsiveContent;
