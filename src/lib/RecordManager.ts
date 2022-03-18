import * as Network from "./Network";
import {
  loadPendingRecords,
  savePendingRecord,
  clearPendingRecords,
  loadPendingPhotos,
  clearPendingPhotos,
  savePendingPhotos,
} from "./Storage";
import Logger from "./Logger";
import { Notifications } from "../constants/Strings";

// rejects with PendingPhoto[] (any photo not uploaded)
async function uploadPhotos(photos: PendingPhoto[]): Promise<void> {
  if (photos.length === 0) {
    return Promise.resolve();
  }

  const failedPhotos: Array<PendingPhoto> = [];

  // tried with an array of Promises but photos after first were arriving corrupted
  await photos.reduce(
    (promise, photo) =>
      promise
        .then(() => Network.uploadPhoto(photo))
        .catch(() => {
          failedPhotos.push(photo);
        }),
    Promise.resolve()
  );

  return failedPhotos.length === 0
    ? Promise.resolve()
    : Promise.reject(failedPhotos);
}

type UploadError = {
  title: string;
  message: string;
  pendingPhotos: PendingPhoto[];
  pendingRecords: AlgaeRecord[];
};

// returns the AlgaeRecord server responds with
// rejects with UploadError
async function uploadRecord(
  record: AlgaeRecord,
  photos: Photo[] = []
): Promise<AlgaeRecord> {
  let recordResponse: AlgaeRecord;

  try {
    recordResponse = await Network.uploadRecord(record);
  } catch (error) {
    // Network.uploadRecord rejects with string
    Logger.Warn(`Netork.uploadRecord failed: ${error}`);

    // when record fails to upload, attach photos and save together
    const pendingRecords = await savePendingRecord({
      ...record,
      photos,
    });

    const pendingPhotos = await loadPendingPhotos();

    const uploadError: UploadError = {
      title: Notifications.uploadRecordFailed.title,
      message: Notifications.uploadRecordFailed.message,
      pendingRecords,
      pendingPhotos,
    };

    return Promise.reject(uploadError);
  }

  try {
    // attach server assigned record id to each photo
    const pendingPhotos = photos.map<PendingPhoto>((photo) => ({
      ...photo,
      id: recordResponse.id,
    }));
    await uploadPhotos(pendingPhotos);
  } catch (failedPhotos) {
    Logger.Warn(`RecordManager.uploadPhotos failed`);

    let pendingPhotos: Array<PendingPhoto> = await loadPendingPhotos();
    pendingPhotos = await savePendingPhotos([
      ...pendingPhotos,
      ...failedPhotos,
    ]);

    const pendingRecords = await loadPendingRecords();
    const title =
      failedPhotos.length > 1
        ? Notifications.uploadPhotosFailed.title
        : Notifications.uploadPhotoFailed.title;
    const message =
      failedPhotos.length > 1
        ? Notifications.uploadPhotosFailed.message
        : Notifications.uploadPhotoFailed.message;

    const uploadError: UploadError = {
      title,
      message,
      pendingPhotos,
      pendingRecords,
    };

    // propagate photo uploadError to uploadRecord.catch handler
    return Promise.reject(uploadError);
  }

  return recordResponse;
}

// uploads photos that were saved while user was offline
function retryPhotos(): Promise<void> {
  return loadPendingPhotos().then((pendingPhotos) => {
    if (pendingPhotos.length === 0) {
      return Promise.resolve();
    }

    // don't propagate error in retry
    return clearPendingPhotos().then(() =>
      uploadPhotos(pendingPhotos).catch((failedPhotos) =>
        savePendingPhotos(failedPhotos).then(() => Promise.resolve())
      )
    );
  });
}

// uploads records that were saved while user was offline
// returns the current array of pending records
// TODO: rename "retryPendingData" and return void
function retryPendingRecords(): Promise<AlgaeRecord[]> {
  return loadPendingRecords()
    .then(async (records) => {
      if (records.length === 0) {
        return [];
      }

      await clearPendingRecords();

      return records.reduce(
        (promise, record) =>
          promise
            .then(() => {
              const { photos } = record;
              // @ts-ignore (currently photos will always be [] and never undefined)
              return uploadRecord(record, photos);
            })
            .catch((error) =>
              Logger.Warn(
                `uploadRecord rejected: continue records reducer to prevent data loss: ${error}`
              )
            ),
        Promise.resolve()
      );
    })
    .then(() => retryPhotos().then(() => loadPendingRecords()));
}

export { uploadRecord, retryPendingRecords };
