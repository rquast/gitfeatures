import React, { useContext, useEffect, useState } from 'react';
import SortableTree, { isDescendant, TreeItem } from 'react-sortable-tree';
import TreeNodeRenderer from '../renderer/TreeNodeRenderer';
import { store as exampleMapStore } from '../../context/ExampleMapContext';
import { Flex, Box, Text, useColorMode } from '@chakra-ui/react';
import { getTreeIndexByNode } from '../../utils/TreeUtils';
import changeSelectedTreeAction from '../../actions/changeSelectedTreeAction';
import nodeClickedAction from '../../actions/nodeClickedAction';
import setNodesAction from '../../actions/setNodesAction';
import touchedAction from '../../actions/touchedAction';
import useUndoable from '../../hooks/useUndoable';
import useTree from '../../hooks/useTree';
import type { Dispatch } from 'react';
import type {
  Action,
  SpecNode,
  MapNode,
  MapTreeState,
  SpecTreeState
} from '../../types';
import useAppState from '../../hooks/useAppState';

function Tree({
  state,
  dispatch,
  type,
  height
}: {
  state: SpecTreeState | MapTreeState;
  dispatch: Dispatch<Action>;
  type: string;
  height: number;
}) {
  const { colorMode } = useColorMode();
  const exampleMapContext = useContext(exampleMapStore);
  const [treeIndex, setTreeIndex] = useState<number>();
  const { currentRepositoryURL } = useAppState();
  const { currentSpecNode, currentMapNode } = useTree();
  const { undoable } = useUndoable();

  const getSelectedNode = (): SpecNode | MapNode | undefined => {
    if (type === 'spec') {
      return currentSpecNode;
    } else if (type === 'map') {
      return currentMapNode;
    }
  };

  useEffect(() => {
    setTreeIndex(state.selectedTreeIndex);
  }, [state.selectedTreeIndex]);

  const canDrop = (obj: {
    nextParent: TreeItem | null;
    node: TreeItem | null;
  }) => {
    switch (type) {
      case 'spec':
        if (obj.nextParent) {
          switch (obj.node?.type) {
            case 'folder':
              return (
                obj.nextParent.type === null || obj.nextParent.type === 'folder'
              );
            case 'feature':
              return (
                obj.nextParent.type === null || obj.nextParent.type === 'folder'
              );
            case 'map':
              return (
                obj.nextParent.type === null ||
                obj.nextParent.type === 'feature'
              );
          }
        }
        break;
      case 'map':
        if (obj.nextParent) {
          switch (obj.node?.type) {
            case 'story':
              return obj.nextParent.type === null;
            case 'rule':
              return (
                obj.nextParent.type === null || obj.nextParent.type === 'story'
              );
            case 'example':
              return (
                obj.nextParent.type === null || obj.nextParent.type === 'rule'
              );
          }
        }
        break;
    }
    return true;
  };

  const nodeClicked = async (evt: any, rowInfo: any) => {
    // Note: do not click when dragging or expanding/collapsing
    const tagName = evt.target.tagName.toLowerCase();
    if (
      ['div'].includes(tagName) &&
      !evt.target.classList.contains('st__moveHandle')
    ) {
      if (rowInfo?.node?.type === 'map') {
        exampleMapContext.dispatch(changeSelectedTreeAction(rowInfo.node.key));
      }
      await dispatch(nodeClickedAction(rowInfo, currentRepositoryURL));
      // Note: must set the index after just in case the previous node index is the same as the new one and useEffect doesn't trigger
      setTreeIndex(rowInfo.treeIndex);
    }
  };

  if (state.tree && state.tree.length > 0) {
    return (
      <Flex
        direction="column"
        flexGrow={1}
        css={{
          ...(colorMode === 'dark'
            ? {
                '.rst__lineHalfHorizontalRight::before,.rst__lineFullVertical::after,.rst__lineHalfVerticalTop::after,.rst__lineHalfVerticalBottom::after,.rst__lineChildren::after': {
                  background: '#4A5568'
                },
                '.st__lineChildren::after': {
                  backgroundColor: '#4A5568'
                },
                '.st__collapseButton,.st__expandButton': {
                  border: 'none',
                  backgroundColor: '#4A5568',
                  color: '#718096'
                },
                '.st__collapseButton': {}
              }
            : {
                '.rst__lineHalfHorizontalRight::before,.rst__lineFullVertical::after,.rst__lineHalfVerticalTop::after,.rst__lineHalfVerticalBottom::after,.rst__lineChildren::after': {
                  background: '#CBD5E0'
                },
                '.st__lineChildren::after': {
                  backgroundColor: '#CBD5E0'
                },
                '.st__collapseButton,.st__expandButton': {
                  border: '1px solid #CBD5E0',
                  backgroundColor: 'white',
                  color: '#A0AEC0'
                },
                '.st__collapseButton': {}
              })
        }}
      >
        <SortableTree
          style={{ height: '100%' }}
          innerStyle={{ paddingTop: '8px', paddingBottom: '8px' }}
          rowHeight={height}
          treeData={state.tree}
          scaffoldBlockPxWidth={28}
          onChange={(treeData: any) => {
            undoable([
              { type, action: setNodesAction(treeData) },
              { type, action: touchedAction() }
            ]);
          }}
          onVisibilityToggle={async ({ treeData, node, expanded }) => {
            // is the selected node a descendent of the toggled node?
            if (isDescendant(node, getSelectedNode() as TreeItem)) {
              // is the selected node visible anymore?
              if (expanded) {
                // if yes, reselect it by looking up its index and setting selectedTreeIndex
                const selectedNode = getSelectedNode();
                if (selectedNode) {
                  const index = getTreeIndexByNode(selectedNode, treeData);
                  if (index >= 0) {
                    setTreeIndex(index);
                  }
                }
              } else {
                // if no, click the thing that was collapsed as the current
                const treeIndex = getTreeIndexByNode(node, treeData);
                await dispatch(
                  nodeClickedAction({ node, treeIndex }, currentRepositoryURL)
                );
              }
            } else {
              // just reselect the selected node
              const selectedNode = getSelectedNode();
              if (selectedNode) {
                const index = getTreeIndexByNode(selectedNode, treeData);
                if (index >= 0) {
                  setTreeIndex(index);
                }
              }
            }
          }}
          onDragStateChanged={(data: any) => {
            if (data.isDragging) {
              setTreeIndex(undefined);
            }
          }}
          onMoveNode={(data: any) => {
            if (data.prevTreeIndex === treeIndex) {
              setTreeIndex(data.nextTreeIndex);
            } else {
              // select the selected node again (because the position may have moved)
              const selectedNode = getSelectedNode();
              if (state.tree && selectedNode) {
                setTreeIndex(getTreeIndexByNode(selectedNode, state.tree));
              }
            }
          }}
          theme={{ nodeContentRenderer: TreeNodeRenderer } as any}
          canDrop={canDrop}
          generateNodeProps={(rowInfo) => {
            const nodeProps: any = {
              onClick: (event: any) => nodeClicked(event, rowInfo)
            };
            if (
              typeof treeIndex !== 'undefined' &&
              treeIndex === rowInfo.treeIndex
            ) {
              nodeProps.className = 'st__rowSelection';
            }
            return nodeProps;
          }}
        />
      </Flex>
    );
  } else {
    return (
      <Box p={4} fontSize="sm">
        <Text>Please add an item ...</Text>
      </Box>
    );
  }
}

export default Tree;
