import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import axios from "axios";

dayjs.extend(duration);

const npmDownloadsURL = (path: string) =>
  `https://api.npmjs.org/downloads/${path}`;

export interface Download {
  downloads: number;
  day: string;
}

export interface PackageDownloadResponse {
  package: string;
  downloads: Download[];
}

class PackageDownloads {
  static fetchDownloads = async (
    packageName: string,
    startDate: string,
    endDate: string
  ): Promise<PackageDownloadResponse> => {
    const startDjs = dayjs(startDate);
    const endDjs = dayjs(endDate);

    const apiDaysLimit = 540;
    const days = dayjs.duration(endDjs.diff(startDjs)).asDays();

    const requiredApiCalls = Math.ceil(days / apiDaysLimit);

    const responses = [];

    for (let i = 1; i <= requiredApiCalls; i += 1) {
      const callStartMoment = endDjs
        .clone()
        .subtract(i * apiDaysLimit - 1, "days");
      const callEndMoment = endDjs
        .clone()
        .subtract((i - 1) * apiDaysLimit, "days");

      const callStartDate = callStartMoment.isBefore(startDjs)
        ? startDjs.format("YYYY-MM-DD")
        : callStartMoment.format("YYYY-MM-DD");
      const callEndDate = callEndMoment.format("YYYY-MM-DD");

      const response = PackageDownloads.fetchFromApi(
        packageName,
        `${callStartDate}:${callEndDate}`
      );

      responses.push(response);
    }

    // Wait for responses to return and combine into single array
    const fetchedDownloads = await Promise.all(responses);

    fetchedDownloads.reverse();

    return {
      package: packageName,
      downloads: fetchedDownloads.reduce(
        (acc, val) => acc.concat(val.downloads),
        []
      ),
    };
  };

  static fetchFromApi = async (
    packageName: string,
    period: string
  ): Promise<any> => {
    const url = npmDownloadsURL(`range/${period}/${packageName}`);
    return axios.get(url).then((res) => res.data);
  };

  static fetchPoint = async (
    packageName: string,
    period = "last-month"
  ): Promise<any> => {
    const url = npmDownloadsURL(`point/${period}/${packageName}`);
    return axios.get(url).then((res) => res.data);
  };
}

export default PackageDownloads;
