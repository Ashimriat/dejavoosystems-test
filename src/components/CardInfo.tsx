import React from 'react';
import { withStyles, createStyles, WithStyles } from "@material-ui/core";
import Grid from '@material-ui/core/Grid';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Typography from '@material-ui/core/Typography';
import classnames from 'classnames';

import Chart from './Chart';
import { CardData, TotalCellValue, ChartData, SubRow} from '../interfaces';

interface Props extends WithStyles<typeof styles> {
  classes: any
  data: CardData
}

interface State {
  activePosition: number
}

const styles = createStyles({
  value: {
    fontSize: 20,
    fontWeight: 600,
  },
  title: {
    fontSize: 16,
    fontWeight: 600,
    color: '#a5b2b7'
  },
  pointer: {
    '&:hover': {
      cursor: 'pointer'
    }
  },
  flexContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  colorIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 10,
    display: 'inline-block'
  },
  tableHeadCell: {
    background: '#f5f7fa',
    color: '#9fa0a0',
    fontWeight: 600,
    fontSize: 14
  },
  tableBodyCell: {
    border: '2px solid #e0e0e0'
  },
  totalTextCell: {
    paddingLeft: 54,
  }
});

class CardInfo extends React.PureComponent<Props, State> {
  activePositionName: string
  activePositionData: Array<SubRow>
  activePositionTotals: Array<TotalCellValue>
  activePositionChartData: ChartData
  constructor(props: Props) {
    super(props);

    this.state = {
      activePosition: -1,
    };

    this.activePositionName = '';
    this.activePositionData = [];
    this.activePositionTotals = [];
    this.activePositionChartData = {};
  }

  showPositionInfo(index: number): void {
    const { data } = this.props;

    // @ts-ignore
    this.activePositionName = data.rows[index].fields[0].value;
    this.activePositionData = data.rows[index].subRows;
    this.activePositionTotals = [...data.totals].map(total => {
      return {id: total.id, value: 0}
    });
    this.activePositionData.forEach(dataPoint => {
      dataPoint.fields.forEach(field => {
        let sameTotalIndex = this.activePositionTotals.findIndex(total => total.id === field.id);
        if (sameTotalIndex !== -1) {
          // @ts-ignore
          this.activePositionTotals[sameTotalIndex].value += field.value;
        }
      })
    });
    this.activePositionChartData = this.formChartData(this.activePositionData, this.activePositionTotals);

    this.setState({activePosition: index});
  }

  showPositionInfoByName(positionName: string): void {
    const { data } = this.props;

    this.showPositionInfo(data.rows.findIndex(row => row.fields[0].value === positionName))
  }

  formChartData(dataForChart?: Array<SubRow>, totalsForChart?: Array<TotalCellValue>): ChartData {
    const { data } = this.props;

    let labels = [], values = [], colors = [];

    const dataSource = dataForChart ? dataForChart : data.rows;
    const totalsSource = totalsForChart ? totalsForChart : data.totals;

    dataSource.forEach((row, rowIndex) => {
      labels.push(row.fields[0].value);
      // @ts-ignore
      values.push(row.fields[1].value / totalsSource[0].value * 100);
      let color = dataForChart ?
        data.viewSettings.plots[1].legends.find(legend => legend.name === row.fields[0].value).color
        :
        data.viewSettings.plots[0].legends.find(legend => legend.name === row.fields[0].value).color;
      colors.push(`#${color}`);
    });

    let chartInfo = {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors,
        hoverBackgroundColor: colors
      }]
    }

    return chartInfo;
  }

  renderTable(dataToDraw?: Array<SubRow>, totalsToDraw?: Array<TotalCellValue>): React.ReactNode {
    const { data, classes } = this.props;

    const drawingData = dataToDraw ? dataToDraw : data.rows;
    const totals = dataToDraw ? totalsToDraw : data.totals;

    return (
      <Table>
        <TableHead>
          <TableRow>
            {
              data.fieldsInfo.map(field => {
                if (
                  (dataToDraw && field.name === "Card Type")
                  ||
                  (!dataToDraw && field.name === 'Transaction Type')
                ) return null;
                return (
                  <TableCell
                    key={`head-${field.id}`}
                    className={classnames(classes.tableHeadCell, classes.tableBodyCell)}
                  >
                    {field.name}
                  </TableCell>
                )
              })
            }
          </TableRow>
        </TableHead>
        <TableBody>
          {
            drawingData.map((row, rowIndex) => {
              return (
                <TableRow key={`row-${rowIndex}`}>
                  {
                    row.fields.map((field, fieldIndex) => {
                      return(
                        <TableCell
                          key={`cell-${fieldIndex}`}
                          className={classnames(
                            classes.tableBodyCell,
                            field.id === 0 && classes.pointer
                          )}
                          onClick={() => field.id === 0 && this.showPositionInfo(rowIndex)}
                        >
                          {field.id === 0 || field.id === 1 ?
                            <div className={classes.flexContainer}>
                              <div
                                className={classes.colorIndicator}
                                style={{backgroundColor: dataToDraw ?
                                    `#${data.viewSettings.plots[1]
                                      .legends.find(legend => legend.name === field.value).color}`
                                    :
                                    `#${data.viewSettings.plots[0]
                                      .legends.find(legend => legend.name === field.value).color}`}}
                              />
                              {field.value}
                            </div>
                            :
                            field.value
                          }
                        </TableCell>
                      );
                    })
                  }
                </TableRow>
              );
            })
          }
          <TableRow>
            <TableCell className={classnames(classes.tableBodyCell, classes.totalTextCell)}>
              {"Total"}
            </TableCell>
            {totals.map((total, totalIndex) => {
                return(
                  <TableCell
                    key={`cellTotal-${totalIndex}`}
                    className={classes.tableBodyCell}
                  >
                    {total.value}
                  </TableCell>
                );
              })
            }
          </TableRow>
        </TableBody>
      </Table>
    );
  }

  renderTotalsInfo(totals?: Array<TotalCellValue>): React.ReactNode {
    const { data, classes } = this.props;

    const totalsInfo = totals ? totals : data.totals;
    const underlineColor = totals ?
      data.viewSettings.plots[0]
        .legends.find(legend => legend.name === this.activePositionName).color
      :
      'ffffff',
      title = totals ?
        data.viewSettings.plots[0].legends.find(legend => legend.name === this.activePositionName).name
        :
        'Card Types';
    return (
      <Grid
        container
        justify={'center'}
        alignItems={'center'}
        direction={'column'}
        spacing={16}
      >
        <Grid item>
          <Typography
            className={classes.title}
            style={totals && {
              textDecoration: 'underline',
              textDecorationColor: `#${underlineColor}`
            }}
          >
            {title}
          </Typography>
        </Grid>
        <Grid
          item
          container
          justify={'center'}
          alignItems={'center'}
        >
          <Grid
            item
            container
            direction={'column'}
            justify={'center'}
            alignItems={'center'}
            xs={6}
          >
            <Grid item>
              <Typography className={classes.value}>
                {totalsInfo[0].value}
              </Typography>
            </Grid>
            <Grid item>
              <Typography className={classes.title}>
                {'Total Amount'}
              </Typography>
            </Grid>
          </Grid>
          <Grid
            item
            container
            direction={"column"}
            justify={'center'}
            alignItems={'center'}
            xs={6}
          >
            <Grid item>
              <Typography className={classes.value}>
                {totalsInfo[1].value}
              </Typography>
            </Grid>
            <Grid item>
              <Typography className={classes.title}>
                {'Transactions'}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    )
  }

  render(): React.ReactNode {
    const { activePosition } = this.state;

    return (
      <Grid
        container
        direction={'column'}
        spacing={16}
      >
        <Grid item>
          {this.renderTotalsInfo()}
          <Chart
            chartType={'doughnut'}
            data={this.formChartData.bind(this)()}
            elementClickAction={this.showPositionInfoByName.bind(this)}
          />
          {this.renderTable()}
        </Grid>
        {activePosition !== -1 &&
          <Grid item>
            {this.renderTotalsInfo(this.activePositionTotals)}
            <Chart
              chartType={'doughnut'}
              data={this.activePositionChartData}
            />
            {this.renderTable(this.activePositionData, this.activePositionTotals)}
          </Grid>
        }
      </Grid>
    );
  }
}

export default withStyles(styles)(CardInfo);