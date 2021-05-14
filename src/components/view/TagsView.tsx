import { HStack, Tag, TagCloseButton, TagLabel } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import useTree from '../../hooks/useTree';
import setValueAction from '../../actions/setValueAction';
import touchedAction from '../../actions/touchedAction';
import useUndoable from '../../hooks/useUndoable';
import type { TagValue } from '../../types';

function TagsView() {
  const { currentSpecNode } = useTree();

  const { undoable } = useUndoable();

  const [tags, setTags] = useState<TagValue[]>([]);

  useEffect(() => {
    if (currentSpecNode) {
      setTags(currentSpecNode.tags || []);
    }
  }, [currentSpecNode]);

  const removeTag = (tagIndex: number) => {
    if (!currentSpecNode) {
      return;
    }
    const newTags = [...(currentSpecNode.tags || [])];
    newTags.splice(tagIndex, 1);
    undoable([
      {
        type: 'spec',
        action: setValueAction(currentSpecNode, 'tags', newTags)
      },
      { type: 'spec', action: touchedAction() }
    ]);
  };

  return (
    <>
      <HStack spacing={4}>
        {tags.map((tag: { type: string; name: string }) => (
          <Tag
            size="sm"
            key={tags.indexOf(tag)}
            variant="subtle"
            colorScheme="gray"
          >
            <TagLabel>{tag.name}</TagLabel>
            <TagCloseButton
              aria-label="Remove Tag"
              onClick={() => removeTag(tags.indexOf(tag))}
            />
          </Tag>
        ))}
      </HStack>
    </>
  );
}

export default TagsView;
