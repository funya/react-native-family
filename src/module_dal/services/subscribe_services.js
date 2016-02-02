import {Http} from '../../utils/http';

const SubscribeServices = {
  subscribe(data){
    return Http.post({
      url : '/api/v1/subscriber/subscribe.json',
      data
    });
  }
}

export {SubscribeServices};
