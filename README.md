# ts-math-utils

Math-based objects not inluded in JS, built in TS.

## Intervals

Represents a number interval with the following features

- An Interval can be created from the `IInterval` type passed into Interval constructor
- Or an Interval can be created via string that represents an interval using mathematical notation '[1, 5)' where '[]' are inclusive and '()' are exclusive
- `.toString()` returns this mathematical string notation
- Static functions to validate mathematical string notation and `.toInterval(interval: string): Interval` to statically create an Interval

## Interval Sets

Tracks a list of `Interval`s with the following additional features

- `.sort()` the list of `Interval`s based on the min value
- `addInterval(interval: IInterval | string)` that adds an interval by object or string representation
- `removeInterval(interval: IInterval | string)` that removes an interval by object or string representation
- `removeIntervalByName(name: string)` the removes an interval by the provided name
- `clear()` that clears all the intervals to an empty array
- `mergeIntervals()` that looks at the list of Intervals and combined Intervals that overlap
- `getIntervalGaps(interval?: IInterval | string)` will return a list of Intervals that represent the gaps between the existing Intervals, and when provided an Interval will return an array of Intervals that represent the intersection between the  provided Interval and existing Intervals (useful when providing a new Interval and getting the Intervals that don't already exist, such as efficiently requesting Intervals not yet searched)
- `createIntervalGap(interval?: IInterval | string)` will create a gap in the list of intervals
- `chainIntervals()` will link intervals together so that there are no gaps and turn off `mergeAddedInterval` to prevent future merging all intervals into 1 big interval. This is useful to fix gaps in your intervals.
- `getIntervalsContaining(interval: IntervalNumber | number)` returns an array of Intervals that contain the provided IntervalNumber or number

## Testing

Install http-server globally:

```bash
npm install -g http-server
```

Run the following command in the root directory:

```bash
http-server
```
