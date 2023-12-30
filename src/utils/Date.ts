export class NigerianDate {
  private readonly timeZone: string;

  constructor() {
    // Nigeria is in the West Africa Time (WAT) zone
    this.timeZone = 'Africa/Lagos';
  }

  public getCurrentNigerianDate(): Date {
    const currentDate = new Date();
    const nigerianDate = this.convertToTimeZone(currentDate, this.timeZone);
    return nigerianDate;
  }

  public convertToNigerianTime(inputDate: Date): Date {
    return this.convertToTimeZone(inputDate, this.timeZone);
  }

  private convertToTimeZone(date: Date, targetTimeZone: string): Date {
    const targetDate = new Date(date.toLocaleString('en-US', { timeZone: targetTimeZone }));
    return targetDate;
  }
}
