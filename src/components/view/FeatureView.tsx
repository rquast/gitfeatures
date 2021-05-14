import React, { useEffect, useState } from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  FormHelperText,
  Divider,
  useDisclosure,
  Stack,
  Button,
  RadioGroup,
  Radio
} from '@chakra-ui/react';
import AcceptanceCriteriaView from './AcceptanceCriteriaView';
import CodeEditor from '../editor/CodeEditor';
import { CheckCircleIcon, EditIcon, SmallCloseIcon } from '@chakra-ui/icons';
import changeFeatureToggleAction from '../../actions/changeFeatureToggleAction';
import touchedAction from '../../actions/touchedAction';
import changeToggleConditionsAction from '../../actions/changeToggleConditionsAction';
import DocumentView from './DocumentView';
import useUndoable from '../../hooks/useUndoable';
import useTree from '../../hooks/useTree';

function FeatureView() {
  const { currentSpecNode } = useTree();
  const { undoable } = useUndoable();

  const { isOpen, onClose, onOpen } = useDisclosure();
  const [conditions, setConditions] = useState<string>('');
  const [toggleState, setToggleState] = useState<string>('Disabled');

  const onChangeToggle = (value: any) => {
    if (currentSpecNode) {
      undoable([
        {
          type: 'spec',
          action: changeFeatureToggleAction(currentSpecNode, value)
        },
        { type: 'spec', action: touchedAction() }
      ]);
    }
  };

  const saveConditions = () => {
    if (currentSpecNode) {
      undoable([
        {
          type: 'spec',
          action: changeToggleConditionsAction(currentSpecNode, conditions)
        },
        { type: 'spec', action: touchedAction() }
      ]);
      onClose();
    }
  };

  useEffect(() => {
    if (currentSpecNode) {
      if (!isOpen) {
        setConditions(currentSpecNode.conditions || '');
      }
      setToggleState(currentSpecNode.toggleState || 'Disabled');
    }
  }, [currentSpecNode]);

  return (
    <>
      <DocumentView />

      <Divider />

      <Box pt={2} maxWidth={800}>
        <Box fontWeight="bold" pb={2}>
          Acceptance Criteria
        </Box>
        <AcceptanceCriteriaView featureNode={currentSpecNode} />
      </Box>

      <Divider />

      <Box pt={2}>
        <FormControl as="fieldset">
          <FormLabel as="legend" fontWeight="bold">
            Toggle Status
          </FormLabel>
          <RadioGroup
            name="toggle-state"
            onChange={onChangeToggle}
            value={toggleState}
          >
            <Stack spacing={2} mt={2} mb={4}>
              <Radio value="Disabled" cursor="pointer">
                Disabled
              </Radio>
              <Radio value="Enabled" cursor="pointer">
                Enabled
              </Radio>
              <Radio value="Complete" cursor="pointer">
                Complete
              </Radio>
            </Stack>
          </RadioGroup>
          {toggleState === 'Disabled' && (
            <FormHelperText>
              Feature is disabled and does not appear in the feature toggles
              configuration
            </FormHelperText>
          )}
          {toggleState === 'Enabled' && (
            <FormHelperText>
              Feature is enabled and appears in the feature toggles
              configuration
            </FormHelperText>
          )}
          {toggleState === 'Complete' && (
            <FormHelperText>
              Feature is complete and appears in the feature toggles
              configuration but should be removed from code
            </FormHelperText>
          )}
        </FormControl>
      </Box>

      <Divider />
      <Box pt={2} maxWidth={800}>
        <FormControl as="fieldset">
          <FormLabel as="legend" fontWeight="bold">
            Toggle Conditions
          </FormLabel>
          <CodeEditor
            language="javascript"
            isEditing={isOpen}
            content={conditions}
            onContentChange={setConditions}
          />
          <Stack direction="row" pt={2}>
            {isOpen ? (
              <>
                <Stack>
                  <Button
                    colorScheme="green"
                    leftIcon={<CheckCircleIcon />}
                    onClick={saveConditions}
                    size="sm"
                  >
                    Save
                  </Button>
                </Stack>
                <Stack>
                  <Button
                    colorScheme="gray"
                    leftIcon={<SmallCloseIcon />}
                    onClick={onClose}
                    size="sm"
                  >
                    Cancel
                  </Button>
                </Stack>
                <Stack flexGrow={1} />
              </>
            ) : (
              <>
                <Button
                  colorScheme="blue"
                  leftIcon={<EditIcon />}
                  onClick={() => {
                    onOpen();
                  }}
                  size="sm"
                >
                  Edit
                </Button>
              </>
            )}
          </Stack>
        </FormControl>
      </Box>
    </>
  );
}

export default FeatureView;
