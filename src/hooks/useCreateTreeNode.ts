import useTree from './useTree';
import exampleMapTreeStub from '../stubs/exampleMapTreeStub';
import addTreeNodeAction from '../actions/addTreeNodeAction';
import touchedAction from '../actions/touchedAction';
import createTreeAction from '../actions/createTreeAction';
import useUndoable from './useUndoable';
import { generateSlug } from '../utils/SlugUtils';

const useCreateTreeNode = () => {
  const { currentMapNode, currentSpecNode } = useTree();
  const { undoable } = useUndoable();

  return (type: string, title: string, slug?: string) => {
    switch (type) {
      case 'folder':
      case 'feature':
        if (currentSpecNode) {
          undoable([
            {
              type: 'spec',
              action: addTreeNodeAction(
                slug || generateSlug(),
                title,
                type,
                currentSpecNode
              )
            },
            { type: 'spec', action: touchedAction() }
          ]);
        }
        break;
      case 'map':
        const key = slug || generateSlug();
        const tree = JSON.parse(JSON.stringify(exampleMapTreeStub));
        if (currentSpecNode) {
          undoable([
            {
              type: 'spec',
              action: addTreeNodeAction(key, title, type, currentSpecNode)
            },
            { type: 'spec', action: touchedAction() },
            { type: 'map', action: createTreeAction(key, tree) },
            { type: 'map', action: touchedAction() }
          ]);
        }
        break;
      default:
        if (currentMapNode) {
          undoable([
            {
              type: 'map',
              action: addTreeNodeAction(
                slug || generateSlug(),
                title,
                type,
                currentMapNode
              )
            },
            { type: 'map', action: touchedAction() }
          ]);
        }
    }
  };
};

export default useCreateTreeNode;
