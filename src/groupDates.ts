import dayjs from "dayjs";
import { Download } from "./PackageDownloads";

export interface GroupedDownloads {
  period: Date;
  downloads: number;
}

// Expect format:
// dates: [{"day":"2012-10-22","downloads":279},
//         {"day":"2012-10-23","downloads":2042}]
// period: 'week'
export const groupDownloadsByPeriod = (
  dates: Download[],
  period: "week" | "month" | "year" = "week"
): GroupedDownloads[] => {
  const downloadsGroupedByPeriod: Record<string, number> = {};

  dates.forEach((date) => {
    const startOfPeriodDate = dayjs(date.day)
      .startOf(period)
      .format("YYYY-MM-DD");

    downloadsGroupedByPeriod[startOfPeriodDate] = downloadsGroupedByPeriod[
      startOfPeriodDate
    ]
      ? downloadsGroupedByPeriod[startOfPeriodDate] + date.downloads
      : date.downloads;
  });

  return Object.entries(downloadsGroupedByPeriod).map(([key, value]) => ({
    period: dayjs(key).toDate(),
    downloads: value as number,
  }));
};

export function convertDownloadsToGrowth(
  downloads: GroupedDownloads[]
): GroupedDownloads[] {
  return downloads.slice(52).map((download, index) => ({
    ...download,
    downloads: (download.downloads - downloads[index].downloads),
  }));
}
export const groupGroupedDownloadsByPeriod = (
  dates: GroupedDownloads[],
  period: "week" | "month" | "year" = "week"
): GroupedDownloads[] => {
  const downloadsGroupedByPeriod: Record<string, number> = {};

  dates.forEach((date) => {
    const startOfPeriodDate = dayjs(date.period)
      .startOf(period)
      .format("YYYY-MM-DD");

    downloadsGroupedByPeriod[startOfPeriodDate] = downloadsGroupedByPeriod[
      startOfPeriodDate
      ]
      ? downloadsGroupedByPeriod[startOfPeriodDate] + date.downloads
      : date.downloads;
  });

  const groupedDownloads = Object.entries(downloadsGroupedByPeriod).map(([key, value]) => ({
    period: dayjs(key).toDate(),
    downloads: value as number,
  }));
  return groupedDownloads.slice(0, groupedDownloads.length - 1)
};
