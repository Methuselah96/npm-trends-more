import * as React from "react";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import axios from "axios";
import { AxisOptions, Chart } from "react-charts";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Example />
    </QueryClientProvider>
  );
}

interface Download {
  downloads: number;
  day: string;
}

interface Datum {
  package: string;
  start: string;
  end: string;
  downloads: Download[];
}

function Example() {
  const { isLoading, error, data } = useQuery(["momentData"], () =>
    axios
      .get("https://api.npmjs.org/downloads/range/last-month/moment")
      .then((res) => res.data)
  );

  const series = React.useMemo(
    () => [
      {
        label: "moment",

        data: data?.downloads ?? [],
      },
    ],

    [data]
  );

  const primaryAxis = React.useMemo(
    (): AxisOptions<Download> => ({
      getValue: (datum) => datum.day,
    }),
    []
  );

  const secondaryAxes = React.useMemo(
    (): AxisOptions<Download>[] => [
      {
        getValue: (datum) => datum.downloads,
      },
    ],

    []
  );

  if (isLoading) return "Loading...";

  if (error) return "An error has occurred: " + error.message;

  return (
    <Chart
      options={{
        data: series,
        primaryAxis,
        secondaryAxes,
      }}
    />
  );
}
