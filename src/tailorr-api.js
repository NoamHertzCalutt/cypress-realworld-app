// prettier-ignore-start

class TailorrAPI {
  constructor() {
    this.apiKey = null;
    this.tailorrServerAddress = "http://localhost";
  }

  init = async (apiKey) => {
    this.apiKey = apiKey;
    // TODO: Check key validity
  };

  _getConfig = (method = "GET", body = null) => {
    let config = {
      method,
      headers: {
        "API-Key": this.apiKey,
        "Content-Type": "application/json",
      },
    };

    if (body) {
      config["body"] = JSON.stringify(body);
    }

    return config;
  };

  canUseFeature = async (featureId, customerId) => {
    const permissionUrl = `${this.tailorrServerAddress}/pricing/api/permissions/feature/${customerId}/${featureId}`;

    let res = await fetch(permissionUrl, this._getConfig());

    if (res.ok) {
      return await res.json();
    }

    return false;
  };

  reportUse = async (featureId, customerId, usageAmount) => {
    const reportUrl = `${this.tailorrServerAddress}/pricing/api/usage/${customerId}/${featureId}`;
    const report = {
      amount: usageAmount,
    };

    await fetch(reportUrl, this._getConfig("POST", report));
  };

  addCustomer = async (customerId, subscribedPackageId = null) => {
    const addCustomerUrl = `${this.tailorrServerAddress}/pricing/api/customers/`;
    const config = this._getConfig("POST", { identifier: customerId });

    let res = await fetch(addCustomerUrl, config);
    let operationSuccess = res.ok;

    if (operationSuccess && subscribedPackageId) {
      let subRes = await this.subscribeCustomerToPackage(customerId, subscribedPackageId);
      operationSuccess = subRes.ok && operationSuccess;
    }

    return operationSuccess;
  };

  subscribeCustomerToPackage = async (customerId, subscribedPackageId) => {
    const subscribeCustomerUrl = `${this.tailorrServerAddress}/pricing/api/customers/${customerId}/${subscribedPackageId}`;
    const config = this._getConfig("PUT");

    let res = await fetch(subscribeCustomerUrl, config);

    return res.ok;
  };

  useTailorr = (featureId, customerId, default_value) => {
    const canUseFeature = async (featureId, customerId) => {
      const permissionUrl = `${this.tailorrServerAddress}/pricing/api/permissions/feature/${customerId}/${featureId}`;

      let res = await fetch(permissionUrl, this._getConfig());

      if (res.ok) {
        return await res.json();
      }

      return false;
    };
    return canUseFeature(featureId, customerId);
  };
}

const Tailorr = new TailorrAPI();

export default Tailorr;

// prettier-ignore-end
