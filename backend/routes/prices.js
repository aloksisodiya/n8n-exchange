const express=require('express')
const axios =require('axios')
const router=express.Router()

const CMC_API_KEY = process.env.CMC_API_KEY

const CMC_API_URL = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest'

const SYMBOLS=['BTC','ETH','SOL','BNB','DOGE']

let cache=null
let cacheTime=0
const CACHE_DURATION=8000

router.get('/',async(req,res)=>{
    try{
        const now=Date.now()
        if(cache && now-cacheTime<CACHE_DURATION){
      return res.json({ success: true, data: cache, cached: true })
        }

        const response=await axios.get(CMC_API_URL,{
            headers: {
        'X-CMC_PRO_API_KEY': CMC_API_KEY,
        'Accept':            'application/json',
      },
      params: {
        symbol:  SYMBOLS.join(','),
        convert: 'USD',
      },
      timeout: 8000,
    })

    const shaped={}
    for(const sym of SYMBOLS){
        const coin=response.data.data[sym]
        if(!coin) continue
        const q=coin.quote.USD
        shaped[sym]={
            price: q.price,
            change1h:     q.percent_change_1h,
        change24h:    q.percent_change_24h,
        change7d:     q.percent_change_7d,
        volume24h:    q.volume_24h,
        marketCap:    q.market_cap,
        lastUpdated:  q.last_updated,

        }
    }

    cache=shaped
    cacheTime=now

    return res.json({ success: true, data: shaped, cached: false })
    }catch(error){
            console.error('[PriceRoute] CMC error:', err.message)

    // If CMC fails but we have cached data, return it with a warning
    if (cache) {
      return res.json({ success: true, data: cache, cached: true, stale: true })
    }

    return res.status(500).json({ success: false, error: 'Failed to fetch prices' })

    }

})

module.exports=router