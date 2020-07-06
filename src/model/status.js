class Status {
  constructor ({ name = '', showInBar = false, deletable = false, icon = '' } = {}) {
    this.name = name;
    this.showInBar = showInBar;
    this.deletable = deletable;
    this.icon = icon;
  }
}

export default Status;