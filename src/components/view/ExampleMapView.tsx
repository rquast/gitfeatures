import React, { useEffect, useState } from 'react';
import { Box, Divider, Flex, Stack } from '@chakra-ui/react';
import AcceptanceCriteriaView from './AcceptanceCriteriaView';
import useTree from '../../hooks/useTree';
import TreeNodeTitleInput from '../input/TreeNodeTitleInput';
import DocumentView from './DocumentView';
import type { SpecNode } from '../../types';
import { getParentByNode } from '../../utils/TreeUtils';

function ExampleMapView() {
  const { currentMapNode, currentSpecNode, currentSpecState } = useTree();

  const [featureNode, setFeatureNode] = useState<SpecNode | undefined>(
    undefined
  );

  const getFeatureNode = (): SpecNode | undefined => {
    if (
      currentSpecState.tree &&
      currentSpecNode &&
      currentSpecNode.type === 'map'
    ) {
      const parentNode: SpecNode = getParentByNode(
        currentSpecNode,
        currentSpecState.tree
      ) as SpecNode;
      if (parentNode && parentNode.type === 'feature') {
        return parentNode;
      }
    }
  };

  useEffect(() => {
    const node = getFeatureNode();
    if (node) {
      setFeatureNode(node);
    } else {
      setFeatureNode(undefined);
    }
    return () => {
      setFeatureNode(undefined);
    };
  }, [currentSpecNode, currentSpecState.touched]);

  return (
    <>
      {currentMapNode ? (
        <Flex direction="column" pt={4}>
          <Stack spacing={6}>
            <TreeNodeTitleInput type="map" isDecorated={true} />
            <DocumentView type="map" />
          </Stack>
          {featureNode && (
            <>
              <Divider />
              <Box pt={4} maxWidth={800}>
                <Box fontWeight="bold" pb={2}>
                  Acceptance Criteria
                </Box>
                <AcceptanceCriteriaView featureNode={featureNode} />
              </Box>
            </>
          )}
        </Flex>
      ) : (
        <>
          <Stack>
            Create a story, rule or example from the options on the bottom left.
          </Stack>
        </>
      )}
    </>
  );
}

export default ExampleMapView;
