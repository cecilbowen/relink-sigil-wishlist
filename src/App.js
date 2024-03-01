/* eslint-disable max-len */
import './App.css';
import QuestTable from './components/QuestTable';
import QUESTS from './data/quests.json';
import SIDEQUESTS from './data/sideQuests.json';
import { TextField } from '@mui/material';
import React, { useEffect, useState } from "react";
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import debounce from 'lodash/debounce';

const replaceWithRomanNumerals = inputString => {
  return inputString.replace(/[1-5]/g, digit => ['I', 'II', 'III', 'IV', 'V'][digit - 1] || digit);
};

const App = () => {
  const [searchText, setSearchText] = useState("");
  const [filterQuests, setFilterQuests] = useState(true);
  const [filterSideQuests, setFilterSideQuests] = useState(true);
  const [filterFirstClear, setFilterFirstClear] = useState(true);

  if (QUESTS.length === 0) {
    return null;
  }

  const debouncedOnChange = debounce(ev => {
    setSearchText(ev.target.value);
  }, 300);

  const moddedTextFilter = replaceWithRomanNumerals(searchText);

  return (
    <div className="App">
      <div style={{ display: "flex", flexWrap: 'wrap', margin: '1em 1em 0em 1em' }}>
        <TextField id="outlined-basic" label="Search sigils" variant="outlined"
          size="small"
          sx={{ display: "flex", width: '40em', marginRight: '1em' }}
          onChange={ev => debouncedOnChange(ev)} />
      </div>

      <div style={{ display: "flex", flexWrap: 'wrap', margin: "0em 1em" }}>
        <FormControlLabel control={<Checkbox defaultChecked />} label="Quests"
          onChange={ev => setFilterQuests(ev.target.checked)} />
        <FormControlLabel control={<Checkbox defaultChecked />} label="NPC Side Quests"
          onChange={ev => setFilterSideQuests(ev.target.checked)} />
        <FormControlLabel control={<Checkbox defaultChecked />} label="Include First-Clear Rewards"
          onChange={ev => setFilterFirstClear(ev.target.checked)} />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'row' }}>
        <QuestTable quests={QUESTS} sideQuests={SIDEQUESTS}
          textFilter={moddedTextFilter}
          filters={{
            quests: filterQuests,
            sideQuests: filterSideQuests,
            firstClear: filterFirstClear
          }}
        />
      </div>

      <div>
        <small>
          <a target="_blank" rel="noopener noreferrer" href="https://github.com/cecilbowen/relink-sigil-wishlist">Source Code</a> |&nbsp;
          <a target="_blank" rel="noopener noreferrer" href="https://github.com/cecilbowen/relink-sigil-wishlist/issues/1">Suggest a Missing Sigil</a> |&nbsp;
          References:&nbsp;
          <a target="_blank" rel="noopener noreferrer" href="https://redd.it/1aqtuno">reddit</a>&nbsp;
          <a target="_blank" rel="noopener noreferrer" href="https://nenkai.github.io/relink-modding/resources/quest_drop_rates/">nenkai</a>&nbsp;
        </small>
      </div>
    </div>
  );
};

export default App;
