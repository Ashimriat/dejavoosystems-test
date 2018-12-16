import React from 'react';
import { withStyles, createStyles, WithStyles } from "@material-ui/core";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Typography from '@material-ui/core/Typography';
import Grid from "@material-ui/core/Grid/Grid";
import classnames from 'classnames';

import Chart from './Chart';
import { SummaryData, TotalCellValue, ChartData} from '../interfaces';


interface Props extends WithStyles<typeof styles> {
  classes: any
  data: SummaryData
}

interface State {
  showAppsInfo: boolean
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

class SummaryInfo extends React.PureComponent<Props, State> {
  mainTableData: any
  appsTableData: any
  constructor(props: Props) {
    super(props);

    this.state = {
      showAppsInfo: false
    };

    this.mainTableData = this.structureMainTableData();
    this.appsTableData = this.structureAppsTableData();
  }

  structureMainTableData() {
    const { data } = this.props;

    let rows = [...data.rows];
    let extData = rows.map(row => row.extData),
      hostData = rows.map(row => row.hostData),
      oldData = rows.map(row => row.hostData),
      fields = rows.map(row => row.fields),
      heads = [...data.fieldsInfo];

    let newRows = heads.map(head => {
      return {
        titleCell: head,
        extData: extData.map(field => field.find(fieldInfo => fieldInfo.id === head.id)),
        hostData: hostData.map(field => field.find(fieldInfo => fieldInfo.id === head.id)),
        oldData: oldData.map(field => field.find(fieldInfo => fieldInfo.id === head.id)),
        fields: fields.map(field => field.find(fieldInfo => fieldInfo.id === head.id))
      }
    });
    let dateRow = newRows.find(row => row.titleCell.key === 'Date'),
      dateRowIndex = newRows.findIndex(row => row.titleCell.key === 'Date'),
      firstPart = newRows.slice(0, dateRowIndex),
      secondPart = newRows.slice(dateRowIndex + 1);

    return [dateRow, ...firstPart, ...secondPart];
  }

  structureAppsTableData() {
    const { data } = this.props;

    const subRows = data.rows.map(row => row.subRows);

    let tempSubRows = [];
    subRows.forEach(subRow => {
      subRow.forEach(app => {
        tempSubRows.push(app.fields)
      })
    });

    let appsData = data.viewSettings.plots[0].legends.map(legend => {
      return {
        name: legend.name,
        color: `#${legend.color}`,
        amounts: {
          id: data.fieldsInfo.find(field => field.key === 'TotalAmount').id,
          name: data.fieldsInfo.find(field => field.key === 'TotalAmount').name,
          values: []
        },
        transactions: {
          id: data.fieldsInfo.find(field => field.key === 'TotalCount').id,
          name: data.fieldsInfo.find(field => field.key === 'TotalCount').name,
          values: []
        },
        tips: {
          id: data.fieldsInfo.find(field => field.key === 'Tips').id,
          name: data.fieldsInfo.find(field => field.key === 'Tips').name,
          values: []
        },
        fees: {
          id: data.fieldsInfo.find(field => field.key === 'Fees').id,
          name: data.fieldsInfo.find(field => field.key === 'Fees').name,
          values: []
        },
      }
    });

    appsData.forEach(app => {
      tempSubRows.forEach(tempSubRow => {
        if (tempSubRow[0].value === app.name) {
          tempSubRow.forEach(field => {
            if (field.id === app.amounts.id) app.amounts.values.push(field.value);
            if (field.id === app.transactions.id) app.transactions.values.push(field.value);
            if (field.id === app.tips.id) app.tips.values.push(field.value);
            if (field.id === app.fees.id) app.fees.values.push(field.value);
          })
        }
      })
    });

    return appsData;
  }

  formChartData(): ChartData {
    let labels = this.mainTableData
      .find(position => position.titleCell.key === 'Date').fields
      .map(field => field.value);

    let chartInfo = {
      labels,
      datasets: this.appsTableData.map(app => {
        return {
          label: app.name,
          data: [...app.amounts.values],
          backgroundColor: app.color,
          hoverBackgroundColor: app.color
        }
      })
    }

    return chartInfo;
  }

  toggleAppsInfo() {
    this.setState(prevState => {
      return {
        showAppsInfo: !prevState.showAppsInfo
      }
    })
  }

  renderAppsInfo(): React.ReactNode {
    const { classes } = this.props;

    return this.appsTableData.map((app, appIndex) => {
      return (
        <React.Fragment key={`app-${appIndex}`}>
          <TableRow>
            <TableCell
              className={classes.tableBodyCell}
              rowSpan={4}
              colSpan={2}
            >
              <div className={classes.flexContainer}>
                <div
                  className={classes.colorIndicator}
                  style={{backgroundColor: app.color}}
                />
                {app.name}
              </div>
            </TableCell>
            <TableCell className={classes.tableBodyCell}>
              {app.amounts.name}
            </TableCell>
            {
              app.amounts.values.map((value, index) => {
                return (
                  <TableCell
                    key={`app-${appIndex}-${app.amounts.name}-${index}`}
                    className={classes.tableBodyCell}
                  >
                    {value}
                  </TableCell>
                )
              })
            }
          </TableRow>
          {
            [app.transactions, app.tips, app.fees].map(param => {
              return (
                <TableRow key={`app-${appIndex}-${param.name}`}>
                  <TableCell className={classes.tableBodyCell}>
                    {param.name}
                  </TableCell>
                  {
                    param.values.map((value, index) => {
                      return (
                        <TableCell
                          key={`app-${appIndex}-${param.name}-${index}`}
                          className={classes.tableBodyCell}
                        >
                          {value}
                        </TableCell>
                      )
                    })
                  }
                </TableRow>
              );
            })
          }
        </React.Fragment>
      )
    })
  }

  renderTotalsInfo(totals?: Array<TotalCellValue>) {
    const { data, classes } = this.props;

    let totalsInfo = data.totals.map(total => {
      return {
        name: this.mainTableData.find(point => point.titleCell.id === total.id).titleCell.name,
        value: total.value
      }
    });

    return (
      <Grid
        container
        justify={'center'}
        alignItems={'center'}
        spacing={16}
      >
        {
          totalsInfo.map((infoPoint, index) => {
            return (
              <Grid
                key={`totals-${index}`}
                item
                container
                direction={'column'}
                justify={'center'}
                alignItems={'center'}
                xs={3}
              >
                <Grid item>
                  <Typography className={classes.value}>
                    {infoPoint.value}
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography className={classes.title}>
                    {infoPoint.name}
                  </Typography>
                </Grid>
              </Grid>
            )
          })
        }
      </Grid>
    )
  }

  render(): React.ReactNode {
    const { classes } = this.props;
    const { showAppsInfo } = this.state;

    let currentSource;

    return (
      <>
        {this.renderTotalsInfo()}
        <Chart
          chartType={'bar'}
          data={this.formChartData()}
        />
        <Table>
          <TableBody>
            {
              this.mainTableData.map((position, positionIndex) => {
                if (position.titleCell.id > 9) return null;
                if (position.titleCell.id < 4) {
                  currentSource = position.extData;
                } else if (position.titleCell.id >= 4 && position.titleCell.id < 9) {
                  currentSource = position.fields;
                } else {
                  currentSource = position.hostData;
                }
                return (
                  <React.Fragment key={`position-${positionIndex}`}>
                    <TableRow>
                      <TableCell
                        colSpan={position.titleCell.id === 0 ? position.fields.length + 3 : 3}
                        className={classnames(
                          classes.tableHeadCell,
                          classes.tableBodyCell,
                          position.titleCell.id === 0 && classes.pointer
                        )}
                        onClick={e => {
                          if (position.titleCell.id === 0) this.toggleAppsInfo.bind(this)()
                        }}
                      >
                        {position.titleCell.name}
                      </TableCell>
                      {position.titleCell.id === 0 ?
                        null
                        :
                        currentSource.map((sourcePoint, sourceIndex) => {
                          return (
                            <TableCell
                              key={`value-${positionIndex}-${sourceIndex}`}
                              className={classes.tableBodyCell}
                            >
                              {sourcePoint ? sourcePoint.value : ''}
                            </TableCell>
                          );
                        })
                      }
                    </TableRow>
                    {position.titleCell.id === 0 && showAppsInfo && this.renderAppsInfo()}
                  </React.Fragment>
                )
              })
            }
          </TableBody>
        </Table>
      </>
    )
  }
}

export default withStyles(styles)(SummaryInfo);