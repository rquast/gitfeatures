import React, { useEffect, useState } from 'react';
import { Button, Link, Stack } from '@chakra-ui/react';
import CodeEditor from '../editor/CodeEditor';
import {
  CheckCircleIcon,
  EditIcon,
  ExternalLinkIcon,
  SmallCloseIcon
} from '@chakra-ui/icons';
import setValueAction from '../../actions/setValueAction';
import touchedAction from '../../actions/touchedAction';
import useUndoable from '../../hooks/useUndoable';
import type { SpecNode } from '../../types';

function AcceptanceCriteriaView({
  featureNode
}: {
  featureNode: SpecNode | undefined;
}) {
  const [gherkin, setGherkin] = useState<string>('');
  const [show, setShow] = useState<boolean>(false);

  const { undoable } = useUndoable();

  const toggleShow = () => {
    setShow(!show);
  };

  const saveToggle = () => {
    if (featureNode) {
      undoable([
        {
          type: 'spec',
          action: setValueAction(featureNode, 'gherkin', gherkin)
        },
        { type: 'spec', action: touchedAction() }
      ]);
      setShow(false);
    }
  };

  const cancelToggle = () => {
    if (featureNode) {
      setGherkin(featureNode.gherkin || '');
      setShow(false);
    }
  };

  useEffect(() => {
    if (featureNode && !show) {
      setGherkin(featureNode.gherkin || '');
    }
  }, [featureNode]);

  return (
    <>
      <CodeEditor
        language="gherkin"
        isEditing={show}
        content={gherkin}
        onContentChange={setGherkin}
      />
      <Stack direction="row" pt={2} maxWidth={800}>
        {show ? (
          <>
            <Stack>
              <Button
                colorScheme="green"
                leftIcon={<CheckCircleIcon />}
                onClick={saveToggle}
                size="sm"
              >
                Save
              </Button>
            </Stack>
            <Stack>
              <Button
                colorScheme="gray"
                leftIcon={<SmallCloseIcon />}
                onClick={cancelToggle}
                size="sm"
              >
                Cancel
              </Button>
            </Stack>
            <Stack flexGrow={1} />
            <Stack pr={12}>
              <Link
                href="https://cucumber.io/docs/gherkin/reference/"
                isExternal
              >
                Gherkin Syntax Guide <ExternalLinkIcon mx="2px" />
              </Link>
            </Stack>
          </>
        ) : (
          <>
            <Button
              colorScheme="blue"
              leftIcon={<EditIcon />}
              onClick={() => {
                toggleShow();
              }}
              size="sm"
            >
              Edit
            </Button>
          </>
        )}
      </Stack>
    </>
  );
}

export default AcceptanceCriteriaView;
