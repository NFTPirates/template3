import { Coin } from "../types/coin";
import { GetCoinResponse } from "../types/coingecko/getCoinResponse";
import { IGetCoinHistoricPriceResponse } from "../[pair]/page";
import getFiat from "./fiat.service";

interface IGetCoinProps {
  coinId: string;
}

interface IGetCoinHistoricChart {
  coin1Id: string;
  coin2Id: string;
  days: string;
}

export async function getCoin(props: IGetCoinProps): Promise<Coin | undefined> {
  const coinId = props.coinId.toLowerCase();
  const optionalQueryParams =
    "localization=false&tickers=false&community_data=false&developer_data=false&sparkline=false";

  const url = `https://pro-api.coingecko.com/api/v3/coins/${coinId}`;
  const res = await fetch(`${url}?${optionalQueryParams}`, {
    headers: {
      "Content-Type": "application/json",
      "x-cg-pro-api-key": process.env.CG_API_KEY!,
    },
  });

  if (!res.ok) {
    return undefined;
  }

  const data = (await res.json()) as GetCoinResponse;
  const result: Coin = {
    id: data.id,
    image: data.image.thumb,
    market_data: { current_price: { usd: data.market_data.current_price.usd } },
    name: data.name,
    symbol: data.symbol,
  };

  return result;
}

export async function getCoinHistoricChart(
  props: IGetCoinHistoricChart
): Promise<any> {
  const fiatExists = getFiat({ fiatId: props.coin2Id.toLowerCase() });
  if (fiatExists) {
    const url = `https://pro-api.coingecko.com/api/v3/coins/${props.coin1Id.toLowerCase()}/market_chart?vs_currency=${props.coin2Id.toLowerCase()}&days=${
      props.days
    }&interval=daily`;

    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        "x-cg-pro-api-key": process.env.CG_API_KEY!,
      },
    });

    if (!res.ok) {
      console.log("Failed to fetch data");
      return undefined;
    }

    const data = (await res.json()) as IGetCoinHistoricPriceResponse;

    const chartDataArray: any[] = [];
    if (data) {
      data.prices.map((priceData) => {
        chartDataArray.push({
          date: new Date(priceData[0]).toLocaleDateString(),
          price: Number(priceData[1]),
        });
      });
    }

    return chartDataArray;
  } else {
    const coin2 = await getCoin({ coinId: props.coin2Id });

    if (!coin2) {
      return undefined;
    }

    const url = `https://pro-api.coingecko.com/api/v3/coins/${props.coin1Id.toLowerCase()}/market_chart?vs_currency=${
      coin2.symbol
    }&days=${props.days}&interval=daily`;

    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        "x-cg-pro-api-key": process.env.CG_API_KEY!,
      },
    });

    if (!res.ok) {
      console.log("Failed to fetch data");
      return undefined;
    }

    const data = (await res.json()) as IGetCoinHistoricPriceResponse;

    const chartDataArray: any[] = [];
    if (data) {
      data.prices.map((priceData) => {
        chartDataArray.push({
          date: new Date(priceData[0]).toLocaleDateString(),
          price: Number(priceData[1]),
        });
      });
    }

    return chartDataArray;
  }
}