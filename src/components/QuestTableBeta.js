/* eslint-disable max-len */
import React, { useEffect, useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Rating from '@mui/material/Rating';
import { Chip, Typography, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import TablePagination from '@mui/material/TablePagination';
import TablePaginationActions from './TablePaginationActions';
import CasinoIcon from '@mui/icons-material/Casino';
// import _ from 'lodash';
import { dummy } from '../util';
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
    backgroundColor: '#2b677a17'
  }
}));

const PaginationBox = styled(Box)`
  display: flex;
`;

const Difficulty = styled(Typography)`
  font-weight: bold;
  margin-left: 1em;
  border-radius: 5px;
  font-family: monospace;
  background-color: #bababa;
  padding: 0px 4px;
`;

const QuestTableBeta = ({
  quests, sideQuests, questInfo, textFilter, filters, showDropChance, blurExtras
}) => {
  const [filteredQuests, setFilteredQuests] = useState([]);
  const pageOptions = [
    { label: '10', value: 10 },
    { label: '30', value: 30 },
    { label: '50', value: 50 },
    { label: '70', value: 70 },
    { label: 'All', value: -1 }
  ];
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(pageOptions[0].value);
  const [tableSize, setTableSize] = useState(0); // because lazy
  const [lastTableSize, setLastTableSize] = useState(0);
  const [ratings, setRatings] = useState(new Map()); // [quest id, rating]
  const darkMode = useThemeDetector();
  const compact = true;

  useEffect(() => {
    const tempRatings = new Map(ratings);
    for (const q of quests) {
      tempRatings.set(q.id, 5);
    }
    setRatings(tempRatings);
  }, [quests]);

  useEffect(() => {
    let tempFilteredQuests = [];
    if (filters.quests) {
      // tempFilteredQuests = _.cloneDeep(quests);
      tempFilteredQuests = [...quests];
    }
    if (filters.sideQuests) {
      tempFilteredQuests.push(...sideQuests.map(x => {
        return {
          name: x.name,
          town: x.town,
          tiers: {
            0: { lots: [] },
            1: { lots: [] },
            2: { lots: [] },
            3: { lots: [] },
            4: { lots: [] },
            5: { lots: [] },
            firstClear: { drops: [] },
            npc: {
              drops: x.sigils.map(y => {
                return {
                  name: y,
                  quantity: 1,
                  dropChance: 100
                };
              })
            }
          }
        };
      }));
    }

    tempFilteredQuests = tempFilteredQuests.filter(item => {
        return Object.values(item.tiers).some(tier => {
            return (tier.lots || [{ drops: tier.drops }]).some(lot => {
                return lot.drops.some(drop => {
                    return drop.name.toLowerCase().includes(textFilter.toLowerCase());
                });
            });
        });
    });
    setFilteredQuests(tempFilteredQuests);
  }, [filters, textFilter]);

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

  const flex = '1';
  const rowStyle = { ...{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { backgroundColor: darkMode ? '#2b677a17' : '#6edbff66' } } };

  let lotCount = 0;
  const procedes = [25, 50, 75, 100];

  const renderLot = (lot, idx, noGroup) => {
    if (lot.drops.length === 0) {
      return null;
    }
    lotCount++;

    const paperBackground = lotCount % 2 === 0 ? 'alt1' : 'alt2';
    const isThereATextFilter = textFilter && textFilter.trim().length > 0;

    if (isThereATextFilter) {
      lot.drops.sort((a, b) => {
        const includesSearchTextA = a.name.toLowerCase().includes(textFilter.toLowerCase());
        const includesSearchTextB = b.name.toLowerCase().includes(textFilter.toLowerCase());

        // drops with search criteria near top of lot
        if (includesSearchTextA && !includesSearchTextB) {
            return -1;
        } else if (!includesSearchTextA && includesSearchTextB) {
            return 1;
        }

        return 0; // og order
      });
    }

    return <Grid item xs="auto" key={`lot-${idx}`}
      alignItems="center"
      justifyContent="flex-start"
      sx={{ maxWidth: '100% !important' }} // , backgroundColor: lotCount % 2 === 0 ? 'lightgray' : ''
    >
      <Grid container item direction="row" xs="auto" className={noGroup ? '' : paperBackground} sx={{
        borderRadius: '10px',
        // backgroundColor: noGroup ? 'transparent' : paperBackground,
        padding: noGroup ? 'default' : '4px',
        rowGap: '4px'
      }}>

      {lot.drops.map((drop, dropIndex) => {
        const chance = drop.dropChance || 100;
        let focus = false;
        let opacity = 1;
        let filter = '';
        let fontWeight = '';
        if (!filters.exclusive && isThereATextFilter) {
          const hasSearchText = drop.name.toLowerCase().includes(textFilter.toLowerCase());
          if (!hasSearchText) {
            opacity = 0.3;
            filter = blurExtras ? 'blur(1.5px)' : filter;
          } else {
            focus = true;
            fontWeight = 'bold';
            // border = '2px solid black';
          }
        }

        let hide = false;
        if (filters.exclusive && isThereATextFilter) {
          const hasSearchText = drop.name.toLowerCase().includes(textFilter.toLowerCase());
          hide = !hasSearchText;
        }

        let dropColor = 'default';
        let dropClass = '';
        if (chance <= procedes[3]) { dropClass = 'greenChip'; dropColor = 'success'; }
        if (chance < procedes[2]) { dropClass = 'yellowChip'; dropColor = 'warning'; }
        if (chance < procedes[1]) { dropClass = 'orangeChip'; dropColor = 'warning'; }
        if (chance < procedes[0]) { dropClass = 'redChip'; dropColor = 'error'; }

        if (darkMode && dropClass === "greenChip" && noGroup) {
          dropClass += " firstClearChip";
        }

        const label = drop.quantity > 1 ? `x${drop.quantity} ${drop.name}` : drop.name;
        const icon = showDropChance ? <div style={{
          display: 'flex',
          background: 'linear-gradient(to top right, #dfdfdf82, mediumpurple)',
          borderRadius: '25px',
          height: 'calc(100% - 2px)'
        }}>
          <CasinoIcon sx={{ color: 'white', marginRight: '2px', width: '20px', paddingLeft: '4px' }} />
          <Typography sx={{ fontWeight: 'bold', paddingRight: '4px', color: 'rgba(0,0,0,0.7)' }}>{chance}%</Typography>
        </div> : null;

        return (
          <Grid item key={`gridChip-${dropIndex}`} alignItems="center" sx={{ display: hide ? 'none' : '', marginRight: '4px' }}>
            <Chip sx={{ cursor: 'pointer', fontSize: '12px', opacity, filter, fontWeight }}
              className={dropClass}
              color={dropColor}
              deleteIcon={icon}
              onDelete={showDropChance ? dummy : undefined}
              label={label}
              title={`${chance}% from ${lot.type === 'chest' ? 'Chest' : 'Rewards'}`}
              variant={focus ? 'elevated' : 'filled'}
              size={compact ? "small" : "medium"}
            />
          </Grid>
        );
      })}
      </Grid>
    </Grid>;
  };

  const renderTier = (tier, tierName) => {
    if (tier.drops && tier.drops.length === 0) {
      return null;
    } else if (!tier.drops) {
      const myDrops = tier.lots.filter(x => x.drops.length > 0);
      if (myDrops.length === 0) {
        return null;
      }
    }

    return <Grid item container direction="row" alignItems="center" spacing={1} xs="auto">
      <Grid item xs={0.5} sx={{ minWidth: '6em' }}>
        <Typography sx={{ fontSize: '12px', fontWeight: 'bold' }}>{tierName}</Typography>
      </Grid>
      {tier.drops && [{ drops: tier.drops }].map((x, i) => renderLot(x, i, true))}
      {!tier.drops && tier.lots.map((x, i) => renderLot(x, i))}
    </Grid>;
  };

  const renderQuest = quest => {
    const score = ratings.get(quest.id) || 0;
    const ranks = ["C", "B", "A", "S", "S+", "S++"];
    const rank = ranks[score];
    const difficulty = questInfo.filter(x => x.id === quest.id)[0]?.difficulty;

    return <Grid container>
      <Grid container item direction="column" sx={{ rowGap: '4px' }}>
        <Grid container item direction="row">
          <Grid item sx={{ display: 'flex' }}>
            <Typography sx={{ fontWeight: 'bold' }}>{quest.name}</Typography>
            {difficulty && <Difficulty className="diffChip">{difficulty}</Difficulty>}
          </Grid>
          <Grid item sx={{ marginLeft: '1em', display: 'flex', maxWidth: 'fit-content' }}>
            {!quest.tiers.npc && <Rating
              name="simple-controlled"
              value={score}
              precision={1}
              onChange={(event, newValue) => {
                const tempRatings = new Map(ratings);
                tempRatings.set(quest.id, newValue);
                setRatings(tempRatings);
              }}
            />}
            {!quest.tiers.npc && <Typography sx={{ marginLeft: '1em' }}>{rank}</Typography>}
          </Grid>
        </Grid>
        <Grid container item direction="column" sx={{ marginLeft: '1em', maxWidth: 'fit-content !important' }} spacing={1}>
          {filters.firstClear && renderTier(quest.tiers.firstClear, "First-Clear")}
          {renderTier(quest.tiers["0"], 'C Rank')}
          {score >= 1 && renderTier(quest.tiers["1"], 'B Rank')}
          {score >= 2 && renderTier(quest.tiers["2"], 'A Rank')}
          {score >= 3 && renderTier(quest.tiers["3"], 'S Rank')}
          {score >= 4 && renderTier(quest.tiers["4"], 'S+ Rank')}
          {score >= 5 && renderTier(quest.tiers["5"], 'S++ Rank')}
          {quest.tiers.npc && renderTier(quest.tiers.npc, quest.town)}
        </Grid>
      </Grid>

    </Grid>;
  };

  return (
    <Paper className="mainPaper" id="main1" style={{ margin: "1em", flex, order: '1', overflow: 'auto', height: 'fit-content' }}>
      <TableContainer sx={{ maxHeight: "69vh", overflowY: "auto", width: '100%' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <StyledTableCell align="left">{filters.allItems ? 'Quest Drops' : 'Quest Sigil Drops'}</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(rowsPerPage > 0 ? filteredQuests.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : filteredQuests)
              .map(quest => {
                return <StyledTableRow
                  key={quest.name}
                  sx={rowStyle}
                >
                  <StyledTableCell align="left">{renderQuest(quest)}</StyledTableCell>
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

QuestTableBeta.propTypes = {
  quests: PropTypes.array.isRequired,
  sideQuests: PropTypes.array.isRequired,
  questInfo: PropTypes.array.isRequired,
  textFilter: PropTypes.string,
  filters: PropTypes.object,
  showDropChance: PropTypes.bool,
  blurExtras: PropTypes.bool
};
export default QuestTableBeta;
