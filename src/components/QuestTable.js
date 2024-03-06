import React, { useEffect, useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TextField from '@mui/material/TextField';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import TablePagination from '@mui/material/TablePagination';
import TablePaginationActions from './TablePaginationActions';
import { useThemeDetector } from '../hooks/useThemeDetector';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
  '&:hover': {
    backgroundColor: '#6edbff16'
  }
}));

const PaginationBox = styled(Box)`
  display: flex;
`;

const sigilCatMap = {
  firstClear: "First-Clear",
  reward: "Reward",
  drop: "Drop",
  unlisted: "Unlisted",
  npcSideQuest: "Complete Side Quest"
};
const sigilColorMap = {
  firstClear: "darkcyan",
  reward: "blue",
  drop: "#bd4545",
  unlisted: "#916700",
  npcSideQuest: "violet"
};

const QuestTable = ({
    quests, sideQuests, textFilter, filters
  }) => {
    const [filteredQuests, setFilteredQuests] = useState([]);
    const pageOptions = [
      { label: '30', value: 30 },
      { label: '50', value: 50 },
      { label: '70', value: 70 },
      { label: 'All', value: -1 }
    ];
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(pageOptions[0].value);
    const [tableSize, setTableSize] = useState(0); // because lazy
    const [lastTableSize, setLastTableSize] = useState(0);
    const darkMode = useThemeDetector();

    useEffect(() => {
      let tempFilteredQuests = [];
      if (filters.quests) { tempFilteredQuests.push(...quests); }
      const sQuests = sideQuests.map(x => {
        return {
          ...x,
          npc: true,
          sigils: {
            firstClear: [], reward: [], drop: [], unlisted: [],
            npcSideQuest: [...x.sigils]
          }
        };
      });
      if (filters.sideQuests) { tempFilteredQuests.push(...sQuests); }
      tempFilteredQuests = tempFilteredQuests.filter(x => x.sigils.firstClear.length > 0 ||
        x.sigils.reward.length > 0 || x.sigils.drop.length > 0 || x.sigils?.unlisted?.length > 0 ||
        x.sigils?.npcSideQuest?.length > 0);
      for (const q of tempFilteredQuests) {
        q.sigils.unlisted = q.sigils.unlisted || [];
        q.sigils.npcSideQuest = q.sigils.npcSideQuest || [];
      }

      if (textFilter && textFilter.length > 0) {
        tempFilteredQuests = tempFilteredQuests.filter(x => {
          let allQuestSigils = [...x.sigils.reward, ...x.sigils.drop, ...x.sigils.unlisted, ...x.sigils.npcSideQuest];
          if (filters.firstClear) {
            allQuestSigils = [...x.sigils.firstClear, ...allQuestSigils];
          }
          return allQuestSigils.filter(y => y.toLowerCase().includes(textFilter.toLowerCase())).length > 0;
        });
      }

      setFilteredQuests(tempFilteredQuests);
    }, [filters]);

    useEffect(() => {
      setTableSize(filteredQuests.length);
    }, [filteredQuests]);

    useEffect(() => {
      if (tableSize !== lastTableSize) {
        setPage(0);
        setLastTableSize(filteredQuests.length);
      }
    }, [tableSize]);

    const handleChangePage = (event, newPage) => {
      setPage(newPage);
    };

    const handleChangeRowsPerPage = event => {
      const rpp = parseInt(event.target.value, 10);
      setRowsPerPage(rpp);
      setPage(0);
    };

    const sigilsToTextField = (sigils, propName) => {
      const sigilArr = sigils[propName];
      if (!sigilArr) { return null; }
      if (textFilter && textFilter.length > 0) {
        sigilArr.sort((a, b) => {
          // If a matches the search word, move it to the beginning
          if (a.toLowerCase().includes(textFilter.toLowerCase())) { return -1; }
          // If b matches the search word but not a, move b to the beginning
          if (b.toLowerCase().includes(textFilter.toLowerCase())) { return 1; }
          // Otherwise, maintain the original order
          return 0;
        });
      }

      if (sigilArr.length > 0) {
        let hasSigil = false;
        if (textFilter && textFilter.length > 0) {
          hasSigil = sigilArr.filter(y => y.toLowerCase().includes(textFilter.toLowerCase())).length > 0;
        }

        return <TextField id="outlined-basic" label={sigilCatMap[propName]} variant="outlined"
          key={`tfield-${propName}`}
          size="small"
          sx={{
            display: "flex",
            marginRight: '1em',
            width: `calc(${sigilArr.join(', ').length}ch + 10em)`,
            backgroundColor: hasSigil ? '#ffd70040' : ''
          }}
          fullWidth
          focused={hasSigil}
          value={sigilArr.join(', ')}
          InputProps={{
            style: { fontFamily: 'monospace', color: sigilColorMap[propName] },
            readOnly: true
          }}
        />;
      }

      return null;
    };

    const flex = '1';
    // eslint-disable-next-line max-len
    const rowStyle = { ...{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { backgroundColor: darkMode ? '#2b677a17' : '#6edbff66' } } };

    const renderSigils = sigils => {
      const ret = [];

      const firstClear = sigilsToTextField(sigils, "firstClear");
      const reward = sigilsToTextField(sigils, "reward");
      const drop = sigilsToTextField(sigils, "drop");
      const unlisted = sigilsToTextField(sigils, "unlisted");
      const npcSideQuest = sigilsToTextField(sigils, "npcSideQuest");

      if (firstClear && filters.firstClear) { ret.push(firstClear); }
      if (reward) { ret.push(reward); }
      if (drop) { ret.push(drop); }
      if (unlisted) { ret.push(unlisted); }
      if (npcSideQuest) { ret.push(npcSideQuest); }

      return <div style={{ display: 'flex', flexWrap: 'wrap', rowGap: '10px' }}>
        {ret}
      </div>;
    };

    return (
      <Paper className="mainPaper" id="main1" style={{ margin: "1em", flex, order: '1', overflow: 'auto', height: 'fit-content' }}>
        <TableContainer sx={{ maxHeight: "69vh", overflowY: "auto", width: '100%' }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <StyledTableCell sx={{ width: '12em', fontWeight: 'bold' }}>Name</StyledTableCell>
                <StyledTableCell align="left">Difficulty</StyledTableCell>
                <StyledTableCell align="left">Category</StyledTableCell>
                <StyledTableCell align="left">Sigils</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody className="questBody">
              {(rowsPerPage > 0 ? filteredQuests.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : filteredQuests)
                .map(quest => {
                  return <StyledTableRow
                    key={quest.name}
                    sx={rowStyle}
                  >
                    <StyledTableCell align="left" sx={{ fontWeight: 'bold', fontStyle: quest.npc ? 'italic' : '' }}>
                      {quest.name}
                    </StyledTableCell>
                    <StyledTableCell align="left">{quest.difficulty || quest.town}</StyledTableCell>
                    <StyledTableCell align="left">{quest.npc ? "NPC Side Quest" : "Quest"}</StyledTableCell>
                    <StyledTableCell align="left">{renderSigils(quest.sigils)}</StyledTableCell>
                  </StyledTableRow>;
                }
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
            component={PaginationBox}
            rowsPerPageOptions={pageOptions}
            colSpan={3}
            count={filteredQuests.length}
            rowsPerPage={rowsPerPage}
            labelRowsPerPage="" // ideally add words if screen wide enough
            page={page}
            SelectProps={{
              inputProps: {
                'aria-label': 'rows per page',
              },
              native: true,
              sx: { marginRight: '1em', marginLeft: '0em' },
              title: "Rows Per Page"
            }}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            ActionsComponent={TablePaginationActions}
        />
      </Paper>
    );
};

QuestTable.propTypes = {
  quests: PropTypes.array.isRequired,
  sideQuests: PropTypes.array.isRequired,
  textFilter: PropTypes.string,
  filters: PropTypes.object
};
export default QuestTable;
