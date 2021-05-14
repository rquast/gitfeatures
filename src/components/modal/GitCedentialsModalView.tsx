import React, { useContext, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  FormErrorMessage,
  Select,
  IconButton,
  FormHelperText,
  Link,
  Divider,
  useToast,
  Collapse,
  Box,
  Textarea,
  Tooltip
} from '@chakra-ui/react';
import {
  CheckCircleIcon,
  RepeatClockIcon,
  DeleteIcon,
  ViewIcon,
  ViewOffIcon
} from '@chakra-ui/icons';
import { store as appStateStore } from '../../context/AppStateContext';
import touchedAction from '../../actions/touchedAction';
import useAppState from '../../hooks/useAppState';

const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const urlRegex = /^(?:(?:https?):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;

const GitConfigModalView = () => {
  const {
    setValue,
    getValues,
    handleSubmit,
    errors,
    register,
    formState
  } = useForm();
  const appStateContext = useContext(appStateStore);

  const { config } = useAppState();

  const cancelDeleteRef: any = useRef();

  const [gitProfiles, setGitProfiles]: [any, any] = useState({});
  const [currentProfile, setCurrentProfile]: [any, any] = useState('');

  const [peekUsername, setPeekUsername] = useState(false);
  const [peekPassword, setPeekPassword] = useState(false);

  const [isConfirmDeleteProfile, setIsConfirmDeleteProfile] = useState(false);

  const toast = useToast();

  function validateProfileName(value: string) {
    return RegExp(/^\p{L}/, 'u').test(value)
      ? true
      : 'Not a valid profile name';
  }

  function validateCorsAddress(value: string) {
    if (value.trim().length === 0) {
      return true;
    }
    if (
      value.startsWith('http://localhost') ||
      value.startsWith('http://127.0.0.1')
    ) {
      return true;
    } else {
      return urlRegex.test(value) ? true : 'Not a valid URL';
    }
  }

  function validateAuthorName(value: string) {
    return RegExp(/^\p{L}/, 'u').test(value) ? true : 'Not a valid author name';
  }

  function validateAuthorEmail(value: string) {
    return emailRegex.test(value.toLowerCase())
      ? true
      : 'Not a valid email address';
  }

  function validatePGPPrivateKey(value: string) {
    // TODO: check it is a valid key using isomorphic-pgp
    const length = value.trim().length;
    if (length < 1024 * 32) {
      return true;
    } else {
      return 'Not a valid PGP key';
    }
  }

  function validateUsername(value: string) {
    const length = value.trim().length;
    if (length > 0 && length < 256) {
      return true;
    } else {
      return 'Not a valid username';
    }
  }

  function validatePassword(value: string) {
    const length = value.trim().length;
    if (length < 256) {
      return true;
    } else {
      return 'Not a valid password';
    }
  }

  function validateDefaultBranch(value: string) {
    // TODO: better validation for branch names
    if (value.trim().length > 0) {
      return true;
    } else {
      return 'Invalid branch name';
    }
  }

  function validateRemoteName(value: string) {
    // TODO: better validation for remote names
    if (['origin', 'upstream'].includes(value)) {
      return true;
    } else {
      return 'Invalid remote name';
    }
  }

  const onSubmit = async (values: any): Promise<void> => {
    const newGitProfile = { ...values };
    delete newGitProfile['selected-profile'];
    await appStateContext.dispatch({
      type: 'SET_GIT_PROFILE',
      payload: newGitProfile
    });
    await appStateContext.dispatch(touchedAction());
    setValue('selected-profile', newGitProfile['profile-name'] + '');
    setCurrentProfile(newGitProfile['profile-name'] + '');
    toast({
      title: 'Saved Git Profile.',
      description: "We've successfully saved your Git configuration profile.",
      status: 'success',
      duration: 9000,
      isClosable: true
    });
  };

  const onClickRevertGitProfiles = () => {
    if (!config) {
      return;
    }
    loadGitProfiles(config.gitProfiles);
  };

  const loadGitProfiles = async (data: any) => {
    await setGitProfiles(JSON.parse(JSON.stringify(data)));
    if (!currentProfile || currentProfile.trim().length === 0) {
      await setCurrentProfile('Default');
    } else if (typeof gitProfiles[currentProfile] !== 'undefined') {
      Object.keys(gitProfiles[currentProfile]).forEach((key) => {
        if (key !== 'selected-profile') {
          setValue(key, gitProfiles[currentProfile][key], {
            shouldDirty: true,
            shouldValidate: false
          });
        }
      });
    }
  };

  const onChangeSelectedProfile = async () => {
    const newProfile = getValues();
    await setCurrentProfile(newProfile['selected-profile'] + '');
  };

  const onClickDeleteProfile = () => {
    if (currentProfile !== 'Default') {
      setIsConfirmDeleteProfile(true);
      cancelDeleteRef.current.focus();
    }
  };

  const onClickConfirmDeleteProfile = async () => {
    setIsConfirmDeleteProfile(false);
    await appStateContext.dispatch({
      type: 'DELETE_GIT_PROFILE',
      payload: currentProfile
    });
    await appStateContext.dispatch(touchedAction());
    setValue('selected-profile', 'Default');
    setCurrentProfile('Default');
    toast({
      title: 'Removed Git Profile.',
      description: "We've successfully removed this Git configuration profile.",
      status: 'success',
      duration: 9000,
      isClosable: true
    });
  };

  useEffect(() => {
    if (appStateContext.state.config?.gitProfiles) {
      loadGitProfiles(appStateContext.state.config.gitProfiles);
    }
  }, [
    appStateContext.state.config?.gitProfiles,
    currentProfile,
    appStateContext.state.touched
  ]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={6}>
        <FormControl isInvalid={errors['selected-profile']}>
          <FormLabel htmlFor="selected-profile">Select a profile</FormLabel>
          <Stack isInline>
            <Select
              name="selected-profile"
              isDisabled={isConfirmDeleteProfile}
              defaultValue={currentProfile}
              onChange={onChangeSelectedProfile}
              ref={register()}
            >
              {Object.keys(gitProfiles).map((key) => {
                const profile = gitProfiles[key];
                return (
                  <option key={key} value={key}>
                    {profile['profile-name']}
                  </option>
                );
              })}
            </Select>
            <Tooltip hasArrow label="Delete profile" bg="red.600" color="white">
              <IconButton
                aria-label="Delete profile"
                isDisabled={isConfirmDeleteProfile}
                icon={<DeleteIcon />}
                onClick={onClickDeleteProfile}
              />
            </Tooltip>
          </Stack>
          <FormErrorMessage>
            {errors['selected-profile'] && errors['selected-profile'].message}
          </FormErrorMessage>
          <Collapse in={isConfirmDeleteProfile} animateOpacity>
            <Stack
              spacing={4}
              mt={4}
              p={4}
              shadow="md"
              borderWidth="1px"
              borderRadius="md"
            >
              <Box>Are you sure you want to delete this profile?</Box>
              <Stack isInline>
                <Button
                  ref={cancelDeleteRef}
                  onClick={() => setIsConfirmDeleteProfile(false)}
                >
                  Cancel
                </Button>
                <Button colorScheme="red" onClick={onClickConfirmDeleteProfile}>
                  Delete
                </Button>
              </Stack>
            </Stack>
          </Collapse>
        </FormControl>
        <FormControl isInvalid={errors['profile-name']} isRequired>
          <FormLabel htmlFor="profile-name">Profile name</FormLabel>
          <Input
            name="profile-name"
            placeholder="Add a profile name ..."
            ref={register({ validate: validateProfileName })}
          />
          <FormErrorMessage>
            {errors['profile-name'] && errors['profile-name'].message}
          </FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={errors['cors-proxy-address']}>
          <FormLabel htmlFor="cors-proxy-address">CORS proxy address</FormLabel>
          <Input
            name="cors-proxy-address"
            placeholder="https://cors.gitfeatures.com"
            ref={register({ validate: validateCorsAddress })}
          />
          <FormErrorMessage>
            {errors['cors-proxy-address'] &&
              errors['cors-proxy-address'].message}
          </FormErrorMessage>
          <FormHelperText>
            Requires a CORS proxy or your remote repository must be configured
            to use custom CORS headers in order to push commits
          </FormHelperText>
        </FormControl>
        <FormControl isInvalid={errors['author-name']} isRequired>
          <FormLabel htmlFor="author-name">Author name</FormLabel>
          <Input
            name="author-name"
            ref={register({ validate: validateAuthorName })}
          />
          <FormErrorMessage>
            {errors['author-name'] && errors['author-name'].message}
          </FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={errors['author-email']} isRequired>
          <FormLabel htmlFor="author-email">Author email</FormLabel>
          <Input
            name="author-email"
            ref={register({ validate: validateAuthorEmail })}
          />
          <FormErrorMessage>
            {errors['author-email'] && errors['author-email'].message}
          </FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={errors['default-branch']}>
          <FormLabel htmlFor="default-branch">Default branch</FormLabel>
          <Input
            name="default-branch"
            placeholder="master"
            ref={register({ validate: validateDefaultBranch })}
          />
          <FormErrorMessage>
            {errors['default-branch'] && errors['default-branch'].message}
          </FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={errors['remote-name']}>
          <FormLabel htmlFor="remote-name">Remote name</FormLabel>
          <Input
            name="remote-name"
            placeholder="origin"
            ref={register({ validate: validateRemoteName })}
          />
          <FormErrorMessage>
            {errors['remote-name'] && errors['remote-name'].message}
          </FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={errors['pgp-private-key']}>
          <FormLabel htmlFor="pgp-private-key">PGP private key</FormLabel>
          <Stack isInline>
            <Textarea
              name="pgp-private-key"
              ref={register({ validate: validatePGPPrivateKey })}
              rows={10}
              wrap="off"
            />
          </Stack>
          <FormErrorMessage>
            {errors['pgp-private-key'] && errors['pgp-private-key'].message}
          </FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={errors['username']} isRequired>
          <FormLabel htmlFor="username">Username</FormLabel>
          <Stack isInline>
            <Input
              name="username"
              ref={register({ validate: validateUsername })}
              {...(!peekUsername ? { type: 'password' } : { type: 'input' })}
              autoComplete="one-time-code"
              readOnly={true}
              onFocus={(evt: React.FocusEvent<HTMLInputElement>) =>
                evt.target.removeAttribute('readonly')
              }
            />
            <Tooltip hasArrow label="Peek username" bg="blue.600" color="white">
              <IconButton
                aria-label="Peek username"
                icon={peekUsername ? <ViewOffIcon /> : <ViewIcon />}
                onMouseDown={() => setPeekUsername(true)}
                onMouseUp={() => setPeekUsername(false)}
              />
            </Tooltip>
          </Stack>
          <FormErrorMessage>
            {errors['username'] && errors['username'].message}
          </FormErrorMessage>
          <FormHelperText>
            If using GitHub, put a{' '}
            <Link
              href="https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token"
              isExternal
            >
              personal token
            </Link>{' '}
            here and leave password blank
          </FormHelperText>
        </FormControl>
        <FormControl isInvalid={errors['password']}>
          <FormLabel htmlFor="password">Password</FormLabel>
          <Stack isInline>
            <Input
              name="password"
              ref={register({ validate: validatePassword })}
              {...(!peekPassword ? { type: 'password' } : { type: 'input' })}
              autoComplete="one-time-code"
              readOnly={true}
              onFocus={(evt: React.FocusEvent<HTMLInputElement>) =>
                evt.target.removeAttribute('readonly')
              }
            />
            <Tooltip hasArrow label="Peek password" bg="blue.600" color="white">
              <IconButton
                aria-label="Peek password"
                icon={peekPassword ? <ViewOffIcon /> : <ViewIcon />}
                onMouseDown={() => setPeekPassword(true)}
                onMouseUp={() => setPeekPassword(false)}
              />
            </Tooltip>
          </Stack>
          <FormErrorMessage>
            {errors['password'] && errors['password'].message}
          </FormErrorMessage>
        </FormControl>
        <Divider />
      </Stack>
      <Stack mt={4} isInline>
        <Button
          colorScheme="gray"
          leftIcon={<RepeatClockIcon />}
          onClick={onClickRevertGitProfiles}
        >
          Revert
        </Button>
        <Button
          type="submit"
          colorScheme="green"
          leftIcon={<CheckCircleIcon />}
          isLoading={formState.isSubmitting}
        >
          Save
        </Button>
      </Stack>
    </form>
  );
};

export default GitConfigModalView;
