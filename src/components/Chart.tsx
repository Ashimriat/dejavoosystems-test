import React from 'react';
import {Doughnut, Bar} from 'react-chartjs-2';

import {ChartData} from "../interfaces";

interface Props {
  chartType: string
  data: ChartData
  elementClickAction?: Function
}

const Chart: React.FunctionComponent<Props> = ({chartType, data, elementClickAction}: Props) => {
  return (
    <>
      {chartType === 'doughnut' &&
        <Doughnut
          data={data}
          onElementsClick={(elems) => {
            if (elems.length && elementClickAction) elementClickAction(elems[0]._model.label)
          }}
        />
      }
      {chartType === 'bar' &&
        <Bar
          data={data}
          width={500}
          height={250}
          options={{
            scales: {
              xAxes: [{
                stacked: true,
              }],
              yAxes: [{
                stacked: true
              }]
            }
          }}
        />
      }
    </>
  )
}

export default Chart;