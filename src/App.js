/* eslint-disable max-len */
import './App.css';
import QuestTable from './components/QuestTable';
import QuestTableBeta from './components/QuestTableBeta';
import QUESTS from './data/quests.json';
import SIDEQUESTS from './data/sideQuests.json';
import QUEST_INFO from './data/questInfo.json';
import QUESTS_DATAMINE_ALL from './data/questDrops.json';
import QUESTS_DATAMINE_SIGILS from './data/questDropsSigils.json';
import { IconButton, TextField } from '@mui/material';
import React, { useEffect, useState } from "react";
import FormControlLabel from '@mui/material/FormControlLabel';
import FiberNewIcon from '@mui/icons-material/FiberNew';
import RestoreIcon from '@mui/icons-material/Restore';
import BlurOnIcon from '@mui/icons-material/BlurOn';
import BlurOffIcon from '@mui/icons-material/BlurOff';
import Checkbox from '@mui/material/Checkbox';
import debounce from 'lodash/debounce';
import { replaceWithRomanNumerals } from './util';

const App = () => {
  const [newUI, setNewUI] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [showDropChance, setShowDropChance] = useState(true);
  const [blurExtras, setBlurExtras] = useState(false);
  const [filterQuests, setFilterQuests] = useState(true);
  const [filterSideQuests, setFilterSideQuests] = useState(false);
  const [filterFirstClear, setFilterFirstClear] = useState(true);
  const [filterExclusive, setFilterExclusive] = useState(false);
  const [filterAllItems, setFilterAllItems] = useState(false);
  const gotleWonderful = new Audio(`${process.env.PUBLIC_URL}/sound/gotle_wonderful.wav`);
  const gotleUnbelievable = new Audio(`${process.env.PUBLIC_URL}/sound/gotle_unbelievable.wav`);

  const debouncedOnChange = debounce(ev => {
    setSearchText(ev.target.value);
  }, 300);

  const moddedTextFilter = replaceWithRomanNumerals(searchText);

  return (
    <div className="App">
      <div style={{ display: "flex", flexWrap: 'wrap', margin: '1em 1em 0em 1em' }}>
        <TextField id="searchBox" label={`Search ${filterAllItems ? 'drops' : 'sigils'}`} variant="outlined"
          size="small" autoFocus
          sx={{ display: "flex", width: '40em', marginRight: '1em' }}
          onChange={ev => debouncedOnChange(ev)} />
        {newUI && <FormControlLabel control={<Checkbox />} label="Exclusive Search"
          title="Excludes non-searched drops if checked"
          onChange={ev => setFilterExclusive(ev.target.checked)} />}
      </div>

      <div style={{ display: "flex", flexWrap: 'wrap', margin: "0em 1em" }}>
        <FormControlLabel control={<Checkbox defaultChecked />} label="Quests"
          onChange={ev => setFilterQuests(ev.target.checked)} />
        <FormControlLabel control={<Checkbox />} label="NPC Side Quests"
          onChange={ev => setFilterSideQuests(ev.target.checked)} />
        <FormControlLabel control={<Checkbox defaultChecked />} label="Include First-Clear Rewards"
          onChange={ev => setFilterFirstClear(ev.target.checked)} />
        {newUI && <FormControlLabel control={<Checkbox />} label="All Items"
          onChange={ev => setFilterAllItems(ev.target.checked)} />}
        {newUI && <FormControlLabel control={<Checkbox defaultChecked />} label="Show Drop Rates"
          onChange={ev => setShowDropChance(ev.target.checked)} />}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'row' }}>
        {!newUI && <QuestTable quests={QUESTS} sideQuests={SIDEQUESTS}
          textFilter={moddedTextFilter}
          filters={{
            quests: filterQuests,
            sideQuests: filterSideQuests,
            firstClear: filterFirstClear
          }}
        />}
        {newUI && <QuestTableBeta quests={filterAllItems ? QUESTS_DATAMINE_ALL : QUESTS_DATAMINE_SIGILS} sideQuests={SIDEQUESTS}
          textFilter={moddedTextFilter}
          filters={{
            quests: filterQuests,
            sideQuests: filterSideQuests,
            firstClear: filterFirstClear,
            exclusive: filterExclusive,
            allItems: filterAllItems
          }}
          showDropChance={showDropChance}
          blurExtras={blurExtras}
          questInfo={QUEST_INFO}
        />}
      </div>

      <div>
        <small>
          <IconButton aria-label="swapUI"
            color="primary" sx={{ cursor: 'pointer' }}
            title={newUI ? 'Swap back to the old UI' : 'Swap to the new UI'}
            onClick={() => {
              const audio = newUI ? gotleWonderful : gotleUnbelievable;
              audio.play(); // lol
              setNewUI(!newUI);
            }}
          >
            {!newUI && <FiberNewIcon />}
            {newUI && <RestoreIcon />}
          </IconButton>
          <a target="_blank" rel="noopener noreferrer" href="https://github.com/cecilbowen/relink-sigil-wishlist">GitHub</a> |&nbsp;
          <a target="_blank" rel="noopener noreferrer" href="https://github.com/cecilbowen/relink-sigil-wishlist/issues">Bug Report</a> |
          References:&nbsp;
          <a target="_blank" rel="noopener noreferrer" href="https://redd.it/1aqtuno">reddit</a>&nbsp;
          <a target="_blank" rel="noopener noreferrer" href="https://nenkai.github.io/relink-modding/resources/quest_drop_rates/">nenkai</a>&nbsp;
          <IconButton aria-label="swapBlur"
            color="primary" sx={{ cursor: 'pointer' }}
            title={blurExtras ? "Stop blurring unrelated search results" : 'Blur unrelated search results'}
            onClick={() => {
              setBlurExtras(!blurExtras);
            }}
          >
            {!blurExtras && <BlurOnIcon />}
            {blurExtras && <BlurOffIcon />}
          </IconButton>
        </small>
      </div>
    </div>
  );
};

export default App;
