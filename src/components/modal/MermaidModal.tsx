import React, { useContext, useState } from 'react';
import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs
} from '@chakra-ui/react';
import useAppState from '../../hooks/useAppState';
import { store as appStateStore } from '../../context/AppStateContext';

function MermaidModal() {
  const appStateContext = useContext(appStateStore);

  const {
    isMermaidModalOpen,
    onInsertValueEvent,
    onCloseMermaidModal
  } = useAppState();

  const [flowChart, setFlowChart] = useState<string>(
    'graph TD\n' +
      '    A[Christmas] -->|Get money| B(Go shopping)\n' +
      '    B --> C{Let me think}\n' +
      '    C -->|One| D[Laptop]\n' +
      '    C -->|Two| E[iPhone]\n' +
      '    C -->|Three| F[fa:fa-car Car]'
  );
  const [ganttChart, setGanttChart] = useState<string>(
    'gantt\n' +
      '    title A Gantt Diagram\n' +
      '    dateFormat  YYYY-MM-DD\n' +
      '    section Section\n' +
      '    A task           :a1, 2014-01-01, 30d\n' +
      '    Another task     :after a1  , 20d\n' +
      '    section Another\n' +
      '    Task in sec      :2014-01-12  , 12d\n' +
      '    another task      : 24d'
  );
  const [pieChart, setPieChart] = useState<string>(
    'pie title Pets adopted by volunteers\n' +
      '    "Dogs" : 386\n' +
      '    "Cats" : 85\n' +
      '    "Rats" : 15'
  );
  const [sequenceDiagram, setSequenceDiagram] = useState<string>(
    'sequenceDiagram\n' +
      '    Alice->>+John: Hello John, how are you?\n' +
      '    Alice->>+John: John, can you hear me?\n' +
      '    John-->>-Alice: Hi Alice, I can hear you!\n' +
      '    John-->>-Alice: I feel great!'
  );
  const [classDiagram, setClassDiagram] = useState<string>(
    'classDiagram\n' +
      '    Animal <|-- Duck\n' +
      '    Animal <|-- Fish\n' +
      '    Animal <|-- Zebra\n' +
      '    Animal : +int age\n' +
      '    Animal : +String gender\n' +
      '    Animal: +isMammal()\n' +
      '    Animal: +mate()\n' +
      '    class Duck{\n' +
      '      +String beakColor\n' +
      '      +swim()\n' +
      '      +quack()\n' +
      '    }\n' +
      '    class Fish{\n' +
      '      -int sizeInFeet\n' +
      '      -canEat()\n' +
      '    }\n' +
      '    class Zebra{\n' +
      '      +bool is_wild\n' +
      '      +run()\n' +
      '    }'
  );
  const [stateDiagram, setStateDiagram] = useState<string>(
    'stateDiagram-v2\n' +
      '    [*] --> Still\n' +
      '    Still --> [*]\n' +
      '    Still --> Moving\n' +
      '    Moving --> Still\n' +
      '    Moving --> Crash\n' +
      '    Crash --> [*]'
  );
  const [
    entityRelationshipDiagram,
    setEntityRelationshipDiagram
  ] = useState<string>(
    'erDiagram\n' +
      '          CUSTOMER }|..|{ DELIVERY-ADDRESS : has\n' +
      '          CUSTOMER ||--o{ ORDER : places\n' +
      '          CUSTOMER ||--o{ INVOICE : "liable for"\n' +
      '          DELIVERY-ADDRESS ||--o{ ORDER : receives\n' +
      '          INVOICE ||--|{ ORDER : covers\n' +
      '          ORDER ||--|{ ORDER-ITEM : includes\n' +
      '          PRODUCT-CATEGORY ||--|{ PRODUCT : contains\n' +
      '          PRODUCT ||--o{ ORDER-ITEM : "ordered in"'
  );

  const insertDiagram = (value: string) => {
    onInsertValueEvent(
      '\n```mermaid\n' + value + '\n```\n',
      appStateContext.state.mermaidModal.eventKey
    );
    onCloseMermaidModal();
  };

  return (
    <Modal
      blockScrollOnMount={false}
      isOpen={isMermaidModalOpen}
      onClose={onCloseMermaidModal}
    >
      <ModalOverlay />
      <ModalContent minWidth={600}>
        <ModalHeader>Insert Mermaid Diagram</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Tabs>
            <TabList>
              <Tab>Flow</Tab>
              <Tab>Gantt</Tab>
              <Tab>Pie</Tab>
              <Tab>Sequence</Tab>
              <Tab>Class</Tab>
              <Tab>State</Tab>
              <Tab>ER</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <Button onClick={() => insertDiagram(flowChart)}>
                  Insert Chart
                </Button>
              </TabPanel>
              <TabPanel>
                <Button onClick={() => insertDiagram(ganttChart)}>
                  Insert Chart
                </Button>
              </TabPanel>
              <TabPanel>
                <Button onClick={() => insertDiagram(pieChart)}>
                  Insert Chart
                </Button>
              </TabPanel>
              <TabPanel>
                <Button onClick={() => insertDiagram(sequenceDiagram)}>
                  Insert Diagram
                </Button>
              </TabPanel>
              <TabPanel>
                <Button onClick={() => insertDiagram(classDiagram)}>
                  Insert Diagram
                </Button>
              </TabPanel>
              <TabPanel>
                <Button onClick={() => insertDiagram(stateDiagram)}>
                  Insert Diagram
                </Button>
              </TabPanel>
              <TabPanel>
                <Button
                  onClick={() => insertDiagram(entityRelationshipDiagram)}
                >
                  Insert Diagram
                </Button>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onCloseMermaidModal}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default MermaidModal;
