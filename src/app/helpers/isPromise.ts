export default function isPromise(value: any): value is Promise<any> {
  // @ts-ignore: https://stackoverflow.com/a/38339199/9449426
  // eslint-disable-next-line eqeqeq
  return Promise.resolve(value) == value;
}
