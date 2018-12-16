import React from 'react';
import { withStyles, createStyles, WithStyles } from "@material-ui/core";
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import isEmpty from 'lodash/isEmpty';

import { API } from '../consts';
import CardInfo from './CardInfo';
import SummaryInfo from './SummaryInfo';
import { CardData, SummaryData } from '../interfaces';
import { sortById, getTimeZoneOffset } from '../utils';

interface Props extends WithStyles<typeof styles> {

}

interface State {
  card: CardData
  cardAnchor: HTMLElement
  showCardData: boolean
  summary: SummaryData
  summaryAnchor: HTMLElement
  showSummaryData: boolean
  loading: boolean
  error: string,
  endDate: string
}

const styles = createStyles({
  appButton: {
    border: '1px solid #AA6483',
    background: '#98CB34',
    color: '#ffffff',
    fontWeight: 600,
    '&:hover': {
      background: '#A37133'
    }
  },
  error: {
    color: '#E32B2D',
    fontWeight: 600,
    fontSize: 16
  }
})

class App extends React.Component<Props, State> {
  minDate: Date
  maxDate: Date
  constructor(props: Props) {
    super(props);

    this.state = {
      card: {},
      cardAnchor: null,
      showCardData: false,
      summary: {},
      summaryAnchor: null,
      showSummaryData: false,
      loading: false,
      error: '',
      endDate: ''
    }

    this.minDate = new Date(2000, 0, 1);
    this.maxDate = new Date(2018, 11,16);
  }

  isEndDateCorrect(endDateString: string): boolean {
    let endDate = new Date(endDateString);
    if (endDate < this.minDate || endDate > this.maxDate) {
      this.setState({
        error: 'Incorrect end date. Please pick date in diapason from 2000-01-01 to 2018-12-16',
        endDate: ''
      })
      return false;
    }
    return true;
  }

  formEndDate(inputValue: string): void {
    if (this.isEndDateCorrect(inputValue))
      this.setState({endDate: `${inputValue}T00:00:00${getTimeZoneOffset()}`});
  }

  getData(url: string, params: Object, callback: Function): void {
    let request = new Request(url, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: "POST",
      body: JSON.stringify(params)
    });

    fetch(request)
      .then(response => response.json())
      .then(result => callback(result))
      .catch(error => {
        console.log(error);
        this.setState({
          loading: false,
          error: `Couldn't obtain information from server`
        });
      });
  }

  toggleCardData(): void {
    this.setState(prevState => {
      return {
        showCardData: !prevState.showCardData
      }
    })
  }

  toggleSummaryData(): void {
    this.setState(prevState => {
      return {
        showSummaryData: !prevState.showSummaryData
      }
    })
  }

  // @ts-ignore
  handleCardMenuClick(event: MouseEvent<HTMLElement>): void {
    this.setState({cardAnchor: event.currentTarget})
  }

  handleCardMenuClose(chosenIndex: number): void {
    const { endDate } = this.state;

    if (chosenIndex) {
      if (endDate) {
        this.setState({
          loading: true,
          cardAnchor: null,
          error: ''
        });
        this.getData(
          API.CARD,
          {
            period: chosenIndex - 1,
            date: endDate
          },
          res => this.setState({
            card: this.arrangeCardData(res),
            showCardData: true,
            loading: false
          })
        );
      } else {
        this.setState({
          cardAnchor: null,
          error: 'Please set end date'
        });
      }
    } else {
      this.setState({cardAnchor: null})
    }
  }

  // @ts-ignore
  handleSummaryMenuClick(event: MouseEvent<HTMLElement>): void {
    this.setState({summaryAnchor: event.currentTarget})
  }

  handleSummaryMenuClose(chosenIndex: number): void {
    const { endDate } = this.state;

    if (chosenIndex) {
      if (endDate) {
        this.setState({
          loading: true,
          summaryAnchor: null,
          error: ''
        });
        this.getData(
          API.SUMMARY,
          {
            period: chosenIndex - 1,
            date: endDate
          },
          res => this.setState({
            summary: this.arrangeSummaryData(res),
            showSummaryData: true,
            loading: false
          })
        );
      } else {
        this.setState({
          summaryAnchor: null,
          error: 'Please set end date'
        });
      }
    } else {
      this.setState({ summaryAnchor: null})
    }
  }

  arrangeCardData(data: CardData): CardData {
    let sortedCardRows = data.rows.map(row => {
      let sortedFields = row.fields.sort(sortById);
      let sortedSubRows = row.subRows.map(subRow => {
        return {fields: subRow.fields.sort(sortById)}
      });
      return {fields: sortedFields, subRows: sortedSubRows};
    });

    let sortedTotals = data.totals.sort(sortById);

    return {
      fieldsInfo: data.fieldsInfo,
      periodInfo: data.periodInfo,
      rows: sortedCardRows,
      totals: sortedTotals,
      viewSettings: data.viewSettings
    }
  }

  arrangeSummaryData(data: SummaryData): SummaryData {
    let sortedCardRows = data.rows.map(row => {
      const { extData, fields, hostData, oldData, subRows } = row;
      let sortedFields = fields.sort(sortById);
      let sortedSubRows = subRows.map(subRow => {
        return {fields: subRow.fields.sort(sortById)}
      });
      return {
        extData,
        fields: sortedFields,
        hostData,
        oldData,
        subRows: sortedSubRows,
      };
    });
    let sortedTotals = data.totals.sort(sortById);

    return {
      fieldsInfo: data.fieldsInfo,
      periodInfo: data.periodInfo,
      rows: sortedCardRows,
      totals: sortedTotals,
      viewSettings: data.viewSettings
    }
  }

  renderMenus(): React.ReactNode {
    const { classes } = this.props;
    const { showCardData, showSummaryData, cardAnchor, summaryAnchor } = this.state;

    return (
      <Grid
        item
        container
        justify={'center'}
        alignItems={'center'}
        spacing={16}
      >
        <Grid item>
          <Button
            className={classes.appButton}
            aria-owns={cardAnchor ? 'card-menu' : undefined}
            aria-haspopup={'true'}
            onClick={e => {
              if (showCardData) {
                this.toggleCardData.bind(this)()
              } else {
                this.handleCardMenuClick.bind(this)(e)
              }
            }}
          >
            {'Show Cards Data'}
          </Button>
          <Menu
            id={'card-menu'}
            anchorEl={cardAnchor}
            open={Boolean(cardAnchor)}
            onClose={this.handleCardMenuClose.bind(this, 0)}
          >
            {
              ['Day', 'Week', 'Month', 'Quarter', 'Year'].map((option, index) => {
                return (
                  <MenuItem
                    key={`card-menu-option-${index}`}
                    onClick={this.handleCardMenuClose.bind(this, index + 1)}
                  >
                    {option}
                  </MenuItem>
                );
              })
            }
          </Menu>
        </Grid>
        <Grid item>
          <Button
            className={classes.appButton}
            aria-owns={summaryAnchor ? 'summary-menu' : undefined}
            aria-haspopup={'true'}
            onClick={e => {
              if (showSummaryData) {
                this.toggleSummaryData.bind(this)()
              } else {
                this.handleSummaryMenuClick.bind(this)(e)
              }
            }}
          >
            {'Show Summary Data'}
          </Button>
          <Menu
            id={'summary-menu'}
            anchorEl={summaryAnchor}
            open={Boolean(summaryAnchor)}
            onClose={this.handleSummaryMenuClose.bind(this, 0)}
          >
            {
              [ 'By days for month',
                'By weeks for quarter',
                'By months for year',
                'By months for quarter',
                'By quarters for year'
              ].map((option, index) => {
                return (
                  <MenuItem
                    key={`summary-menu-option-${index}`}
                    onClick={this.handleSummaryMenuClose.bind(this, index + 1)}
                  >
                    {option}
                  </MenuItem>
                );
              })
            }
          </Menu>
        </Grid>
        <Grid item>
          <Typography>
            {'Choose end date'}
          </Typography>
          <input
            type={'date'}
            onBlur={e => this.formEndDate.bind(this)(e.target.value)}
          />
        </Grid>
      </Grid>
    )
  }

  render(): React.ReactNode {
    const { classes } = this.props;
    const {card, summary, showCardData, showSummaryData, loading, error} = this.state;

    const loader = (
      <Grid
        item
        container
        direction={'column'}
        alignItems={'center'}
        justify={'center'}
        spacing={16}
      >
        <CircularProgress/>
        <Typography>
          {'Loading info, please wait...'}
        </Typography>
      </Grid>
    )
    const errorMessage = (
      <Grid item>
        <Typography className={classes.error}>
          {error}
        </Typography>
      </Grid>
    )

    let content;
    if (loading) {
      content = loader;
    } else if (error) {
      content = errorMessage;
    } else {
      content = (
        <Grid
          item
          container
          direction={'column'}
        >
          {showCardData && (
            <Grid
              item
              container
              alignItems={'center'}
              justify={'center'}
            >
              {isEmpty(card) ?
                <Typography>
                  {'No info about cards available'}
                </Typography>
                :
                <CardInfo data={card}/>
              }
            </Grid>
          )}
          {showSummaryData && (
            <Grid item>
              {isEmpty(summary) ?
                <Typography>
                  {'No info about summary available'}
                </Typography>
                :
                <SummaryInfo data={summary}/>
              }
            </Grid>
          )}
        </Grid>
      )
    }

    return (
      <Grid
        container
        direction={'column'}
        justify={'center'}
        alignItems={'center'}
        spacing={16}
      >
        {this.renderMenus()}
        {content}
      </Grid>
    )
  }
}

export default withStyles(styles)(App);