import React from "react";
import { Avatar, Button } from "@material-ui/core";
import { Chart } from "chart.js";
import { User } from "app/types";
import { useDispatch, userActions, useSelector } from "app/store";

const data = {
  labels: [
    "Label 1",
    "Label 2",
    "Label 3",
    "Label 4",
    "Label 5",
    "Label 6",
    "Label 7",
    "Label 8",
    "Label 9",
    "Label 10",
    "Label 11",
    "Label 12",
    "Label 13",
    "Label 14",
    "Label 15",
    "Label 16",
  ],
  datasets: [
    {
      // label: 'dataset 1',
      // backgroundColor: successColor,
      data: [15, 20, 25, 30, 25, 20, 15, 20, 25, 30, 25, 20, 15, 10, 15, 20],
    },
    {
      // label: 'dataset 2',
      backgroundColor: "#f3f3fb",
      data: [15, 20, 25, 30, 25, 20, 15, 20, 25, 30, 25, 20, 15, 10, 15, 20],
    },
  ],
};

function Profile(props) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const chartRef = React.useRef<HTMLCanvasElement | null>(null);
  const getUser = () => {
    dispatch(userActions.getUserRequest(9449426));
  };
  React.useEffect(() => {
    getUser();
  }, []);
  React.useEffect(() => {
    const myLineChart = new Chart(chartRef.current, {
      type: "line",
      data: data,
      options: {
        title: { display: false },
        tooltips: {
          intersect: false,
          mode: "nearest",
          xPadding: 10,
          yPadding: 10,
          caretPadding: 10,
        },
        legend: { display: false },
        responsive: false, // TODO: fix responsive
        maintainAspectRatio: false,
        barRadius: 4,
        scales: {
          xAxes: [{ display: false, gridLines: false, stacked: true }],
          yAxes: [{ display: false, stacked: true, gridLines: false }],
        },
        layout: { padding: { left: 0, right: 0, top: 0, bottom: 0 } },
      },
    });

    return () => myLineChart.destroy();
  }, []);

  return (
    <div>
      <pre style={{ textAlign: "left" }}>{JSON.stringify(user, null, 4)}</pre>
      <Avatar />
      <canvas ref={chartRef} />
      <Button onClick={getUser}>Click</Button>
    </div>
  );
}

export default Profile;
