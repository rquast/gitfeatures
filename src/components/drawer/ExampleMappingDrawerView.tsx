import React from 'react';
import {
  Heading,
  Link,
  ListItem,
  Stack,
  Text,
  UnorderedList
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';

function ExampleMappingDrawerView() {
  return (
    <Stack overflowY="auto">
      <Heading size="lg" pt={4} pb={4}>
        Why Example Mapping?
      </Heading>
      <Text>
        People often have difficulty developing good stories and acceptance
        criteria, particularly when there is more than one person involved.
        Example mapping is a technique for easily and collaboratively
        discovering what the stories are for a topic (backlog item) and what
        their acceptance criteria should be, by providing concrete examples.
        This is a process known as{' '}
        <Link
          href="https://en.wikipedia.org/wiki/Specification_by_example"
          isExternal
        >
          Specification By Example (SBE) <ExternalLinkIcon mx="2px" />
        </Link>
        .
      </Text>
      <Heading size="lg" pt={12} pb={4}>
        How does it work?
      </Heading>
      <Text>
        An example mapping "session" is a 25 minute meeting that involves
        between one and four people. In the case of a small team, this would be
        a product owner, a developer, a QA tester and a UX designer. In the case
        of a solo developer, you'll need to play the role of all these people or
        find others who can help. During the meeting you will discover stories,
        rules (acceptance criteria) and concrete examples. If there are any
        unknowns, they're added as questions to be answered later on. If all
        questions are not answered, another example mapping meeting is scheduled
        and the process starts again until no questions remain and stories can
        be mapped out in under 25 minutes. If the story can't be mapped out in
        25 minutes, the story must be broken down into smaller stories. Once a
        story is finalized, acceptance criteria are written and the story is
        ready to be worked on. If you think of other stories during the meeting,
        add them to the map to be worked on later.
      </Text>
      <Heading size="lg" pt={12} pb={4}>
        What are the benefits?
      </Heading>
      <Text>
        With all of the examples and rules determined for an example map, it
        becomes very easy to write acceptance criteria in Given, When, Then
        (Gherkin) format for automated tests and test-driven development. It is
        also a great facilitator of conversation in{' '}
        <Link href="https://gitfeatures.com/acceptance-criteria" isExternal>
          Card, Conversation, Confirmation <ExternalLinkIcon mx="2px" />
        </Link>
        .
      </Text>
      <Heading size="lg" pt={12} pb={4}>
        What is the process?
      </Heading>
      <Text>
        <UnorderedList>
          <ListItem>
            Add an "Example Map" node to the tree with the name of the backlog
            item (topic) as the title. You may want to prefix or suffix this
            with the date, or alternatively you can tag it with the date using
            the tag button or key (T).
          </ListItem>
          <ListItem>
            Tag in the people who are attending the meeting along with any other
            relevant information for the map.
          </ListItem>
          <ListItem>
            A timer is set for 25 minutes at the start of the session.
          </ListItem>
          <ListItem>
            Anyone can start by saying something that's either a story, rule
            (acceptance criteria), or an example. As you start adding some of
            these to a map, more things pop into people's heads as they're added
            which kicks off the process. The point is to bounce ideas off one
            another while thinking of the stories, rules, examples and
            questions.
          </ListItem>
          <ListItem>
            If you start with a rule, then think of some concrete examples you
            can use to describe an example of that rule. If it helps, use the
            sketch feature in the editor to draw the example. Also, try to use
            real examples if possible.
          </ListItem>
          <ListItem>
            If you add a user story, use the editor to add a good description in
            a format such as "In order to (achieve some business value), As a
            (stakeholder type), I want (some new system feature)".
          </ListItem>
          <ListItem>
            If you don't understand something or have a question about a story,
            a rule or an example, add a question to it so it can be followed up
            after the meeting.
          </ListItem>
          <ListItem>
            If you think of another story associated with what's being
            discussed, add it so it can also be followed up on after the
            meeting.
          </ListItem>
          <ListItem>
            When there are no questions and the session took under 25 minutes, a
            developer and optionally a tester should be the ones who write the
            Gherkin (Given, When, Then). Once written, the Gherkin should be
            reviewed by the product owner.
          </ListItem>
          <ListItem>
            Unless there are other things needing to be done (RFCs or other
            approvals), once the acceptance criteria are written and approved,
            the story should meet the definition of ready.
          </ListItem>
          <ListItem>
            A follow-on example mapping meeting can and should involve people
            from outside of the team. For instance, a product owner may involve
            several stakeholders with other team members to help answer
            outstanding questions or validate existing rules or examples.
          </ListItem>
        </UnorderedList>
      </Text>
    </Stack>
  );
}

export default ExampleMappingDrawerView;
