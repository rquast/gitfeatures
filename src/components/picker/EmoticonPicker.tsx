import React, { useEffect } from 'react';
import {
  Input,
  InputGroup,
  InputLeftElement,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Wrap,
  WrapItem,
  Collapse,
  Stack,
  Box
} from '@chakra-ui/react';
import * as unicodeEmoji from 'unicode-emoji';
import { useState } from 'react';
import { SearchIcon } from '@chakra-ui/icons';
import useDebounce from '../../hooks/useDebounce';
const emojis = unicodeEmoji.getEmojisGroupedBy('category', {
  version: ['12.1', '13.0', '13.1']
});

function EmoticonPicker(props: any) {
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchEmojis, setSearchEmojis]: [any, any] = useState({
    results: [],
    query: ''
  });
  const [searchInputValue, setSearchInputValue] = useState('');
  const debouncedQuery = useDebounce(searchInputValue, 200);

  const [smileys, setSmileys]: [any, any] = useState(null);
  const [people, setPeople]: [any, any] = useState(null);
  const [nature, setNature]: [any, any] = useState(null);
  const [food, setFood]: [any, any] = useState(null);
  const [activities, setActivities]: [any, any] = useState(null);
  const [travel, setTravel]: [any, any] = useState(null);
  const [objects, setObjects]: [any, any] = useState(null);
  const [symbols, setSymbols]: [any, any] = useState(null);
  const [flags, setFlags]: [any, any] = useState(null);

  useEffect(() => {
    if (emojis) {
      setSmileys(emojis['face-emotion']);
      setPeople(emojis['person-people']);
      setNature(emojis['animals-nature']);
      setFood(emojis['food-drink']);
      setActivities(emojis['activities-events']);
      setTravel(emojis['travel-places']);
      setObjects(emojis['objects']);
      setSymbols(emojis['symbols']);
      setFlags(emojis['flags']);
    }
  }, [emojis]);

  const search = (query: string): void => {
    // assumption: increasing query length if prevSearchEmojis is empty will not change searchEmojis
    if (
      searchEmojis.emojis != null &&
      !Object.values(searchEmojis.emojis).flat().length &&
      searchEmojis.query.length < query.length
    )
      return;

    // use prevSearchEmojis if query length has increased, else use full set
    const index = Object.values(
      searchEmojis.query.length < query.length && searchEmojis.emojis != null
        ? searchEmojis.emojis
        : emojis
    ).flat();

    // simple weighted search to filter emojiObjects
    let results = index
      .map((emoji: any) => ({
        emoji,
        score: (emoji.keywords || [])
          .map((word: string) => word.toLowerCase().indexOf(query) !== -1)
          .reduce(
            (a: any, b: any) => a + Number(b),
            Number(emoji.description.toLowerCase().indexOf(query) !== -1) * 3
          )
      }))
      .filter((a) => a.score !== 0)
      .sort((a, b) => b.score - a.score)
      .map(({ emoji }) => emoji);

    setSearchEmojis({ results, query });
  };

  const renderEmoji = (emojis: any) => {
    if (emojis) {
      return emojis.map((emoji: any) => (
        <WrapItem key={emoji.emoji}>
          <span
            style={{
              padding: '4px',
              fontSize: '20px',
              userSelect: 'none',
              cursor: 'pointer'
            }}
            onClick={() => emojiClicked(emoji.emoji)}
          >
            {emoji.emoji}
          </span>
        </WrapItem>
      ));
    }
  };

  const emojiClicked = (value: string) => {
    props.callback(value, props.eventKey + '');
    if (props.onClose) {
      props.onClose();
    }
  };

  const handleSearchInput = (evt: React.ChangeEvent<HTMLInputElement>) => {
    evt.preventDefault();
    setSearchInputValue(evt.target.value);
  };

  useEffect(() => {
    if (debouncedQuery.length > 0) {
      setIsSearchActive(true);
      search(debouncedQuery.trim().toLowerCase());
    } else {
      setSearchEmojis({ results: [], query: '' });
      setIsSearchActive(false);
    }
  }, [debouncedQuery]);

  const renderSmileys = React.useMemo(() => renderEmoji(smileys), [smileys]);
  const renderPeople = React.useMemo(() => renderEmoji(people), [people]);
  const renderNature = React.useMemo(() => renderEmoji(nature), [nature]);
  const renderFood = React.useMemo(() => renderEmoji(food), [food]);
  const renderActivities = React.useMemo(() => renderEmoji(activities), [
    activities
  ]);
  const renderTravel = React.useMemo(() => renderEmoji(travel), [travel]);
  const renderObjects = React.useMemo(() => renderEmoji(objects), [objects]);
  const renderSymbols = React.useMemo(() => renderEmoji(symbols), [symbols]);
  const renderFlags = React.useMemo(() => renderEmoji(flags), [flags]);

  const renderSearchResults = React.useMemo(
    () => renderEmoji(searchEmojis.results),
    [searchEmojis.results]
  );

  return (
    <Collapse in={props.isOpen} animateOpacity>
      <Box
        d="flex"
        flexDirection="column"
        flexGrow={1}
        borderWidth="1px"
        borderRadius="lg"
        pt={2}
        pl={2}
        pr={2}
        maxWidth="1200px"
      >
        <Stack flexGrow={1}>
          <InputGroup>
            <InputLeftElement
              pointerEvents="none"
              children={<SearchIcon color="gray.300" />}
            />
            <Input onChange={handleSearchInput} />
          </InputGroup>
        </Stack>
        {!isSearchActive ? (
          <Tabs isLazy={true} isFitted={true}>
            <TabList>
              <Tab fontSize="xl">😀</Tab>
              <Tab fontSize="xl">👋</Tab>
              <Tab fontSize="xl">🐵</Tab>
              <Tab fontSize="xl">🍇</Tab>
              <Tab fontSize="xl">🎃</Tab>
              <Tab fontSize="xl">🌍</Tab>
              <Tab fontSize="xl">👒️</Tab>
              <Tab fontSize="xl">💬</Tab>
              <Tab fontSize="xl">🚩</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <Wrap
                  maxHeight="200px"
                  overflowY="auto"
                  overflowX="hidden"
                  pr={1}
                >
                  {renderSmileys}
                </Wrap>
              </TabPanel>
              <TabPanel>
                <Wrap maxHeight="200px" overflowY="auto" overflowX="hidden">
                  {renderPeople}
                </Wrap>
              </TabPanel>
              <TabPanel>
                <Wrap maxHeight="200px" overflowY="auto" overflowX="hidden">
                  {renderNature}
                </Wrap>
              </TabPanel>
              <TabPanel>
                <Wrap maxHeight="200px" overflowY="auto" overflowX="hidden">
                  {renderFood}
                </Wrap>
              </TabPanel>
              <TabPanel>
                <Wrap maxHeight="200px" overflowY="auto" overflowX="hidden">
                  {renderActivities}
                </Wrap>
              </TabPanel>
              <TabPanel>
                <Wrap maxHeight="200px" overflowY="auto" overflowX="hidden">
                  {renderTravel}
                </Wrap>
              </TabPanel>
              <TabPanel>
                <Wrap maxHeight="200px" overflowY="auto" overflowX="hidden">
                  {renderObjects}
                </Wrap>
              </TabPanel>
              <TabPanel>
                <Wrap maxHeight="200px" overflowY="auto" overflowX="hidden">
                  {renderSymbols}
                </Wrap>
              </TabPanel>
              <TabPanel>
                <Wrap maxHeight="200px" overflowY="auto" overflowX="hidden">
                  {renderFlags}
                </Wrap>
              </TabPanel>
            </TabPanels>
          </Tabs>
        ) : (
          <Wrap
            m={4}
            maxHeight="200px"
            overflowY="auto"
            overflowX="hidden"
            pr={1}
            flexGrow={1}
          >
            {renderSearchResults}
          </Wrap>
        )}
      </Box>
    </Collapse>
  );
}

export default EmoticonPicker;
