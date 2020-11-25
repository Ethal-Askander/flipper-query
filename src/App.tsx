import React from 'react';
import './App.css';
import { Button, Card, CardDeck, Dropdown, ProgressBar } from 'react-bootstrap';

//API connection
const API_URL = "http://localhost:" + (process.env.PORT || 8080) + "/";
const API_SEARCH_URL = API_URL + "search/";

//Market places
const markets : string[] = ['StockX'];

//Currencies
const currencies : string[] = ['USD'];

//Defines product details
interface Details {
  brand: string,
  name: string,
  retailPrice: number,
  highestBid: number,
  releaseDate: number,
  thumbnail_url: string,
  url: string
};

//Defines the component state
interface AppState {
  // Search box
  input: string,
  isLoading: boolean,

  // Search preferences
  marketPlace: string,
  currency: string,

  // Products
  products: Details[]
  page: number,
  maxPages: number
}

export default class App extends React.Component<{}, AppState>  {
  constructor(props : AppState) {
    super(props);

    this.state = {
      input: '',
      isLoading: false,
      
      marketPlace: markets[0],
      currency: currencies[0],

      products: [],
      page: 1,
      maxPages: 1
    }
  }

  handleSubmit = (e : any) => {
    e.preventDefault();
    const input = this.state.input;
    this.setState({
      input: "",
      isLoading: true,
    });

    //TODO: handle failure to connnect and empty response
    query(input).then(res => {
      this.setState({
        products: res,
        isLoading: false
      });
    });
  }

  handleInput = (e : any) => {
    e.preventDefault();
    this.setState({input: e.target.value});
  }

  render() {

    const dropDownPages = [];
    for (let i = 1; i <= this.state.maxPages; i++) {
      if (this.state.page !== i)
        dropDownPages.push(<Dropdown.Item onClick={() => this.setState({page: i})} style={{width:'20px'}}>{i}</Dropdown.Item>)
    }

    return (
      <div>
        <div className="title">
          <h1>Shoe Flipper</h1>
        </div>

        <div className="contents-table">
          {/* Search box */}
          <form onSubmit={this.handleSubmit}>
            <input type="text" id="search" name= "search" value={this.state.input} placeholder="Search" onChange={this.handleInput}/>
            {this.state.isLoading ? <div className="icon_animated"/> : <div className="icon"/>}
          </form>

          {/* Market place dropdown */}
          <Dropdown>
            <Dropdown.Toggle variant="success" style={{width: '100px', height:'50px'}} disabled={markets.length <= 1}>
              {this.state.marketPlace}
            </Dropdown.Toggle>

            <Dropdown.Menu>
              {markets.map(market => {
                return this.state.marketPlace === market ? null : <Dropdown.Item onClick={() => this.setState({marketPlace: market})} style={{width:'140px'}}>{market}</Dropdown.Item>
              })}
            </Dropdown.Menu>
          </Dropdown>

          {/* Currencies dropdown */}
          <Dropdown>
            <Dropdown.Toggle variant="success" style={{width: '100px', height:'50px'}} disabled={currencies.length <= 1}>
              {this.state.currency}
            </Dropdown.Toggle>

            <Dropdown.Menu>
              {currencies.map(currency => {
                return this.state.currency === currency ? null : <Dropdown.Item onClick={() => this.setState({currency: currency})} style={{width:'140px'}}>{currency}</Dropdown.Item>
              })}
            </Dropdown.Menu>
          </Dropdown>

          {/* Page dropdown */}
          <Dropdown>
            <Dropdown.Toggle variant="info" style={{width: '50px', height:'50px'}} disabled={dropDownPages.length < 1}>
              {this.state.page}
            </Dropdown.Toggle>

            <Dropdown.Menu>
              {dropDownPages}
            </Dropdown.Menu>
          </Dropdown>
        </div>

        <div className="shoe-box">
          {renderCardDeck(this.state.products)}
        </div>
      </div>
    );
  }
}

/**
 * Calls API requesting information on query
 * @param squery name of item to search for
 * @returns JSON
 */
const query = async (squery: string) => {
  let products : Details[] = [];

  await fetch(API_SEARCH_URL + "?q=" + squery)
    .then(res => res.json())
    .then(res => products = res)
    .catch(err => console.log(err))

  return products;
}

/**
 * Renders a single card of a product
 * @param details interface containing information about the product
 * @returns JSX.Element
 */
const renderCard = (details: Details) : JSX.Element => {
  //Calculating values
  let profit = details.highestBid - details.retailPrice;
  let profitPercentage = Math.floor((profit / details.retailPrice)*100);

  //Changing variant depending on profitability
  let Cardvariant = (profit > 0 ? 'primary' : 'danger');
  let progressVariant = (profit > 0 ? 'success' : 'dark');
  
  //Handling button clicks
  const handleDetailsClick = () => {window.open('https://www.google.com')};
  const handleGoToClick = () => {window.open(details.url, '_blank', 'noreferrer')};

  return (
    <Card
    border='dark'
    bg={Cardvariant}
    text='white'
    style={{ width: '288px'}}
    >
    <Card.Header className="text-center"> <b>{details.name}</b></Card.Header>
    <Card.Img variant="top" src={details.thumbnail_url} />

    <Card.Body>
      <Card.Title className="text-center">
          Cost: ${details.retailPrice} | Price: ${details.highestBid}
          <br />
          Estimated Profit: {profit > 0 ? '$' + profit : '-$' + Math.abs(profit)}
      </Card.Title>

      <ProgressBar variant={progressVariant} now={Math.abs(profitPercentage)} label={`${profitPercentage}%`} />
      <br />

      <Card.Text className="text-center">
      <Button style={{width: '112px'}} variant="light" className="text-center" onClick={handleDetailsClick}><b>Details</b></Button>
      |
      <Button style={{width: '112px'}} variant="light" className="text-center" onClick={handleGoToClick}><b>GoTo</b></Button>
      </Card.Text>
    </Card.Body>

    <Card.Footer className="text-center">
      <small style={{color:"white"}}>Release Date: {details.releaseDate}</small>
    </Card.Footer>
  </Card>
  );
}

/**
 * Renders a deck of cards
 * @param detailsList list of product details to render
 * @returns JSX.Element[]
 */
const renderCardDeck = (detailsList: Details[]) : JSX.Element => {
  return (
    <CardDeck
      key="CardDeck"
      style={{justifyContent: 'center'}}
    >
      {detailsList.map((details : Details) => <div>{renderCard(details)}</div>)}
    </CardDeck>
  );
}