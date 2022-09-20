import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import * as React from "react";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import Chart from 'chart.js/auto';
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

const colors = [
  [0, 116, 217],
  [255, 133, 27],
  [46, 204, 64],
  [255, 65, 54],
  [255, 220, 0],
  [127, 219, 255],
  [177, 13, 201],
  [57, 204, 204],
  [0, 31, 63],
  [1, 255, 112],
];

function Example(): JSX.Element | string {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
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
      data?.map((packageDownload, index) => ({
        label: packageDownload.package,
        data: groupGroupedDownloadsByPeriod(convertDownloadsToGrowth(
          groupDownloadsByPeriod(packageDownload.downloads, "week")
        ), "month"),
        borderColor: `rgba(${colors[index]},1)`,
      })) ?? [],
    [data]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const config = {
      type: 'line',
      data: { datasets: series },
      options: { parsing: { xAxisKey: 'period', yAxisKey: 'downloads' } }
    };

    const myChart = new Chart(
      canvas,
      config
    );
  }, [canvasRef.current, data]);

  if (isLoading) return "Loading...";

  if (error) return "An error has occurred: " + (error as Error).message;

  return (
    <canvas ref={canvasRef} />
  );
}
