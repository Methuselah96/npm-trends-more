import dayjs from "dayjs";
import { useState } from "react";
import * as React from "react";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { AxisOptions, Chart } from "react-charts";
import {
  convertDownloadsToGrowth,
  groupDownloadsByPeriod,
  GroupedDownloads, groupGroupedDownloadsByPeriod,
} from "./groupDates";
import PackageDownloads from "./PackageDownloads";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Example />
    </QueryClientProvider>
  );
}

export const djsToStartDate = (djs: dayjs.Dayjs) =>
  djs.startOf("week").format("YYYY-MM-DD");

function usePackageDownloads(
  names: string[],
  startDate: string,
  endDate: string,
  initialData = []
) {
  return useQuery(["package-downloads", { startDate, endDate, names }], () =>
    Promise.all(
      names.map((name) =>
        PackageDownloads.fetchDownloads(name, startDate, endDate)
      )
    )
  );
}

const packageNames = ["moment", "date-fns", "dayjs", "luxon"];

function Example(): JSX.Element | string {
  const [startDate, setStartDate] = useState(
    djsToStartDate(dayjs().subtract(74, "months"))
  );
  const endDate = dayjs()
    .subtract(1, "week")
    .endOf("week")
    .format("YYYY-MM-DD");
  const { isLoading, error, data } = usePackageDownloads(
    packageNames,
    startDate,
    endDate
  );

  const series = React.useMemo(
    () =>
      data?.map((packageDownload) => ({
        label: packageDownload.package,
        data: groupGroupedDownloadsByPeriod(convertDownloadsToGrowth(
          groupDownloadsByPeriod(packageDownload.downloads, "week")
        ), "month"),
      })) ?? [],
    [data]
  );

  const primaryAxis = React.useMemo(
    (): AxisOptions<GroupedDownloads> => ({
      getValue: (datum) => datum.period,
    }),
    []
  );

  const secondaryAxes = React.useMemo(
    (): AxisOptions<GroupedDownloads>[] => [
      {
        getValue: (datum) => datum.downloads,
        elementType: "line",
      },
    ],

    []
  );

  if (isLoading) return "Loading...";

  if (error) return "An error has occurred: " + (error as Error).message;

  return (
    <div
      style={{
        width: "1500px",
        height: "750px",
      }}
    >
      <Chart
        options={{
          data: series,
          primaryAxis,
          secondaryAxes,
        }}
      />
    </div>
  );
}
