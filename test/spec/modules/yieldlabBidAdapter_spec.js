import { config } from 'src/config.js';
import { expect } from 'chai'
import { spec } from 'modules/yieldlabBidAdapter.js'
import { newBidder } from 'src/adapters/bidderFactory.js'

const REQUEST = {
  'bidder': 'yieldlab',
  'params': {
    'adslotId': '1111',
    'supplyId': '2222',
    'targeting': {
      'key1': 'value1',
      'key2': 'value2',
      'notDoubleEncoded': 'value3,value4'
    },
    'customParams': {
      'extraParam': true,
      'foo': 'bar'
    },
    'extId': 'abc',
    'iabContent': {
      'id': 'foo_id',
      'episode': '99',
      'title': 'foo_title,bar_title',
      'series': 'foo_series',
      'season': 's1',
      'artist': 'foo bar',
      'genre': 'baz',
      'isrc': 'CC-XXX-YY-NNNNN',
      'url': 'http://foo_url.de',
      'cat': ['cat1', 'cat2,ppp', 'cat3|||//'],
      'context': '7',
      'keywords': ['k1,', 'k2..'],
      'live': '0'
    }
  },
  'bidderRequestId': '143346cf0f1731',
  'auctionId': '2e41f65424c87c',
  'adUnitCode': 'adunit-code',
  'bidId': '2d925f27f5079f',
  'sizes': [728, 90],
  'userIdAsEids': [{
    'source': 'netid.de',
    'uids': [{
      'id': 'fH5A3n2O8_CZZyPoJVD-eabc6ECb7jhxCicsds7qSg',
      'atype': 1
    }]
  }],
  'schain': {
    'ver': '1.0',
    'complete': 1,
    'nodes': [
      {
        'asi': 'indirectseller.com',
        'sid': '1',
        'hp': 1
      },
      {
        'asi': 'indirectseller2.com',
        'name': 'indirectseller2 name with comma , and bang !',
        'sid': '2',
        'hp': 1
      }
    ]
  }
}

const VIDEO_REQUEST = Object.assign({}, REQUEST, {
  'mediaTypes': {
    'video': {
      'context': 'instream'
    }
  }
})

const RESPONSE = {
  advertiser: 'yieldlab',
  curl: 'https://www.yieldlab.de',
  format: 0,
  id: 1111,
  price: 1,
  pid: 2222,
  adsize: '728x90',
  adtype: 'BANNER'
}

const VIDEO_RESPONSE = Object.assign({}, RESPONSE, {
  'adtype': 'VIDEO'
})

const PVID_RESPONSE = Object.assign({}, VIDEO_RESPONSE, {
  'pvid': '43513f11-55a0-4a83-94e5-0ebc08f54a2c'
})

const REQPARAMS = {
  json: true,
  ts: 1234567890
}

const REQPARAMS_GDPR = Object.assign({}, REQPARAMS, {
  gdpr: true,
  consent: 'BN5lERiOMYEdiAKAWXEND1AAAAE6DABACMA'
})

const REQPARAMS_IAB_CONTENT = Object.assign({}, REQPARAMS, {
  iab_content: 'id%3Afoo_id%2Cepisode%3A99%2Ctitle%3Afoo_title%252Cbar_title%2Cseries%3Afoo_series%2Cseason%3As1%2Cartist%3Afoo%2520bar%2Cgenre%3Abaz%2Cisrc%3ACC-XXX-YY-NNNNN%2Curl%3Ahttp%253A%252F%252Ffoo_url.de%2Ccat%3Acat1%7Ccat2%252Cppp%7Ccat3%257C%257C%257C%252F%252F%2Ccontext%3A7%2Ckeywords%3Ak1%252C%7Ck2..%2Clive%3A0'
})

describe('yieldlabBidAdapter', function () {
  const adapter = newBidder(spec)

  describe('inherited functions', function () {
    it('exists and is a function', function () {
      expect(adapter.callBids).to.exist.and.to.be.a('function')
    })
  })

  describe('isBidRequestValid', function () {
    it('should return true when required params found', function () {
      const request = {
        'params': {
          'adslotId': '1111',
          'supplyId': '2222'
        }
      }
      expect(spec.isBidRequestValid(request)).to.equal(true)
    })

    it('should return false when required params are not passed', function () {
      expect(spec.isBidRequestValid({})).to.equal(false)
    })
  })

  describe('buildRequests', function () {
    const bidRequests = [REQUEST]
    const request = spec.buildRequests(bidRequests)

    it('sends bid request to ENDPOINT via GET', function () {
      expect(request.method).to.equal('GET')
    })

    it('returns a list of valid requests', function () {
      expect(request.validBidRequests).to.eql([REQUEST])
    })

    it('passes single-encoded targeting to bid request', function () {
      expect(request.url).to.include('t=key1%3Dvalue1%26key2%3Dvalue2%26notDoubleEncoded%3Dvalue3%2Cvalue4')
    })

    it('passes userids to bid request', function () {
      expect(request.url).to.include('ids=netid.de%3AfH5A3n2O8_CZZyPoJVD-eabc6ECb7jhxCicsds7qSg')
    })

    it('passes extra params to bid request', function () {
      expect(request.url).to.include('extraParam=true&foo=bar')
    })

    it('passes unencoded schain string to bid request', function () {
      expect(request.url).to.include('schain=1.0,1!indirectseller.com,1,1,,,,!indirectseller2.com,2,1,,indirectseller2%20name%20with%20comma%20%2C%20and%20bang%20%21,,')
    })

    it('passes iab_content string to bid request', function () {
      expect(request.url).to.include('iab_content=id%3Afoo_id%2Cepisode%3A99%2Ctitle%3Afoo_title%252Cbar_title%2Cseries%3Afoo_series%2Cseason%3As1%2Cartist%3Afoo%2520bar%2Cgenre%3Abaz%2Cisrc%3ACC-XXX-YY-NNNNN%2Curl%3Ahttp%253A%252F%252Ffoo_url.de%2Ccat%3Acat1%7Ccat2%252Cppp%7Ccat3%257C%257C%257C%252F%252F%2Ccontext%3A7%2Ckeywords%3Ak1%252C%7Ck2..%2Clive%3A0')
    })

    const siteConfig = {
      'ortb2': {
        'site': {
          'content': {
            'id': 'id_from_config'
          }
        }
      }
    }

    it('generates iab_content string from bidder params', function () {
      config.setConfig(siteConfig);
      const request = spec.buildRequests([REQUEST])
      expect(request.url).to.include('iab_content=id%3Afoo_id%2Cepisode%3A99%2Ctitle%3Afoo_title%252Cbar_title%2Cseries%3Afoo_series%2Cseason%3As1%2Cartist%3Afoo%2520bar%2Cgenre%3Abaz%2Cisrc%3ACC-XXX-YY-NNNNN%2Curl%3Ahttp%253A%252F%252Ffoo_url.de%2Ccat%3Acat1%7Ccat2%252Cppp%7Ccat3%257C%257C%257C%252F%252F%2Ccontext%3A7%2Ckeywords%3Ak1%252C%7Ck2..%2Clive%3A0')
      config.resetConfig();
    })

    it('generates iab_content string from first party data if not provided in bidder params', function () {
      const requestWithoutIabContent = {
        'params': {
          'adslotId': '1111',
          'supplyId': '2222'
        }
      }
      config.setConfig(siteConfig);
      const request = spec.buildRequests([requestWithoutIabContent])
      expect(request.url).to.include('iab_content=id%3Aid_from_config')
      config.resetConfig();
    })

    const refererRequest = spec.buildRequests(bidRequests, {
      refererInfo: {
        canonicalUrl: undefined,
        numIframes: 0,
        reachedTop: true,
        referer: 'https://www.yieldlab.de/test?with=querystring',
        stack: ['https://www.yieldlab.de/test?with=querystring']
      }
    })

    it('passes unencoded schain string to bid request when complete == 0', function () {
      REQUEST.schain.complete = 0;
      const request = spec.buildRequests([REQUEST])
      expect(request.url).to.include('schain=1.0,0!indirectseller.com,1,1,,,,!indirectseller2.com,2,1,,indirectseller2%20name%20with%20comma%20%2C%20and%20bang%20%21,,')
    })

    it('passes encoded referer to bid request', function () {
      expect(refererRequest.url).to.include('pubref=https%3A%2F%2Fwww.yieldlab.de%2Ftest%3Fwith%3Dquerystring')
    })

    const gdprRequest = spec.buildRequests(bidRequests, {
      gdprConsent: {
        consentString: 'BN5lERiOMYEdiAKAWXEND1AAAAE6DABACMA',
        gdprApplies: true
      }
    })

    it('passes gdpr flag and consent if present', function () {
      expect(gdprRequest.url).to.include('consent=BN5lERiOMYEdiAKAWXEND1AAAAE6DABACMA')
      expect(gdprRequest.url).to.include('gdpr=true')
    })
  })

  describe('interpretResponse', function () {
    it('handles nobid responses', function () {
      expect(spec.interpretResponse({body: {}}, {validBidRequests: []}).length).to.equal(0)
      expect(spec.interpretResponse({body: []}, {validBidRequests: []}).length).to.equal(0)
    })

    it('should get correct bid response', function () {
      const result = spec.interpretResponse({body: [RESPONSE]}, {validBidRequests: [REQUEST], queryParams: REQPARAMS})

      expect(result[0].requestId).to.equal('2d925f27f5079f')
      expect(result[0].cpm).to.equal(0.01)
      expect(result[0].width).to.equal(728)
      expect(result[0].height).to.equal(90)
      expect(result[0].creativeId).to.equal('1111')
      expect(result[0].dealId).to.equal(2222)
      expect(result[0].currency).to.equal('EUR')
      expect(result[0].netRevenue).to.equal(false)
      expect(result[0].ttl).to.equal(300)
      expect(result[0].referrer).to.equal('')
      expect(result[0].meta.advertiserDomains).to.equal('yieldlab')
      expect(result[0].ad).to.include('<script src="https://ad.yieldlab.net/d/1111/2222/?ts=')
      expect(result[0].ad).to.include('&id=abc')
    })

    it('should append gdpr parameters to adtag', function () {
      const result = spec.interpretResponse({body: [RESPONSE]}, {validBidRequests: [REQUEST], queryParams: REQPARAMS_GDPR})

      expect(result[0].ad).to.include('&gdpr=true')
      expect(result[0].ad).to.include('&consent=BN5lERiOMYEdiAKAWXEND1AAAAE6DABACMA')
    })

    it('should append iab_content to adtag', function () {
      const result = spec.interpretResponse({body: [RESPONSE]}, {validBidRequests: [REQUEST], queryParams: REQPARAMS_IAB_CONTENT})
      expect(result[0].ad).to.include('&iab_content=id%3Afoo_id%2Cepisode%3A99%2Ctitle%3Afoo_title%252Cbar_title%2Cseries%3Afoo_series%2Cseason%3As1%2Cartist%3Afoo%2520bar%2Cgenre%3Abaz%2Cisrc%3ACC-XXX-YY-NNNNN%2Curl%3Ahttp%253A%252F%252Ffoo_url.de%2Ccat%3Acat1%7Ccat2%252Cppp%7Ccat3%257C%257C%257C%252F%252F%2Ccontext%3A7%2Ckeywords%3Ak1%252C%7Ck2..%2Clive%3A0')
    })

    it('should get correct bid response when passing more than one size', function () {
      const REQUEST2 = Object.assign({}, REQUEST, {
        'sizes': [
          [800, 250],
          [728, 90],
          [970, 90],
        ]
      })
      const result = spec.interpretResponse({body: [RESPONSE]}, {validBidRequests: [REQUEST2], queryParams: REQPARAMS})

      expect(result[0].requestId).to.equal('2d925f27f5079f')
      expect(result[0].cpm).to.equal(0.01)
      expect(result[0].width).to.equal(728)
      expect(result[0].height).to.equal(90)
      expect(result[0].creativeId).to.equal('1111')
      expect(result[0].dealId).to.equal(2222)
      expect(result[0].currency).to.equal('EUR')
      expect(result[0].netRevenue).to.equal(false)
      expect(result[0].ttl).to.equal(300)
      expect(result[0].referrer).to.equal('')
      expect(result[0].meta.advertiserDomains).to.equal('yieldlab')
      expect(result[0].ad).to.include('<script src="https://ad.yieldlab.net/d/1111/2222/?ts=')
      expect(result[0].ad).to.include('&id=abc')
    })

    it('should add vastUrl when type is video', function () {
      const result = spec.interpretResponse({body: [VIDEO_RESPONSE]}, {validBidRequests: [VIDEO_REQUEST], queryParams: REQPARAMS})

      expect(result[0].requestId).to.equal('2d925f27f5079f')
      expect(result[0].cpm).to.equal(0.01)
      expect(result[0].mediaType).to.equal('video')
      expect(result[0].vastUrl).to.include('https://ad.yieldlab.net/d/1111/2222/?ts=')
      expect(result[0].vastUrl).to.include('&id=abc')
    })

    it('should append gdpr parameters to vastUrl', function () {
      const result = spec.interpretResponse({body: [VIDEO_RESPONSE]}, {validBidRequests: [VIDEO_REQUEST], queryParams: REQPARAMS_GDPR})

      expect(result[0].vastUrl).to.include('&gdpr=true')
      expect(result[0].vastUrl).to.include('&consent=BN5lERiOMYEdiAKAWXEND1AAAAE6DABACMA')
    })

    it('should add renderer if outstream context', function () {
      const OUTSTREAM_REQUEST = Object.assign({}, REQUEST, {
        'mediaTypes': {
          'video': {
            'playerSize': [[640, 480]],
            'context': 'outstream'
          }
        }
      })
      const result = spec.interpretResponse({body: [VIDEO_RESPONSE]}, {validBidRequests: [OUTSTREAM_REQUEST], queryParams: REQPARAMS})

      expect(result[0].renderer.id).to.equal('2d925f27f5079f')
      expect(result[0].renderer.url).to.equal('https://ad.adition.com/dynamic.ad?a=o193092&ma_loadEvent=ma-start-event')
      expect(result[0].width).to.equal(640)
      expect(result[0].height).to.equal(480)
    })

    it('should add pvid to adtag urls when present', function () {
      const result = spec.interpretResponse({body: [PVID_RESPONSE]}, {validBidRequests: [VIDEO_REQUEST], queryParams: REQPARAMS})

      expect(result[0].ad).to.include('&pvid=43513f11-55a0-4a83-94e5-0ebc08f54a2c')
      expect(result[0].vastUrl).to.include('&pvid=43513f11-55a0-4a83-94e5-0ebc08f54a2c')
    })

    it('should append iab_content to vastUrl', function () {
      const result = spec.interpretResponse({body: [VIDEO_RESPONSE]}, {validBidRequests: [VIDEO_REQUEST], queryParams: REQPARAMS_IAB_CONTENT})
      expect(result[0].vastUrl).to.include('&iab_content=id%3Afoo_id%2Cepisode%3A99%2Ctitle%3Afoo_title%252Cbar_title%2Cseries%3Afoo_series%2Cseason%3As1%2Cartist%3Afoo%2520bar%2Cgenre%3Abaz%2Cisrc%3ACC-XXX-YY-NNNNN%2Curl%3Ahttp%253A%252F%252Ffoo_url.de%2Ccat%3Acat1%7Ccat2%252Cppp%7Ccat3%257C%257C%257C%252F%252F%2Ccontext%3A7%2Ckeywords%3Ak1%252C%7Ck2..%2Clive%3A0')
    })
  })
})
