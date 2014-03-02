package main

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/codegangsta/martini"
	"github.com/donovanhide/eventsource"
)

type Comment struct {
	Idx          string
	Author, Text string
}

func (c *Comment) Id() string    { return c.Idx }
func (c *Comment) Event() string { return "comment" }
func (c *Comment) Data() string {
	b, _ := json.Marshal(c)
	return string(b)
}

type ChannelAddition struct {
	Idx, Name string
}

func (c *ChannelAddition) Id() string    { return c.Idx }
func (c *ChannelAddition) Event() string { return "Channel Addition" }
func (c *ChannelAddition) Data() string {
	b, _ := json.Marshal(c)
	return string(b)
}

type IdGenerator struct {
	val int
}

func (idg *IdGenerator) Next() int {
	idg.val += 1
	return idg.val
}

type Channel struct {
	Name string
	Data []Comment
	Repo *eventsource.SliceRepository
}

func (c *Channel) Add(cmt *Comment) {
	c.Data = append(c.Data, *cmt)
	c.Repo.Add(c.Name, cmt)
}

// This uses SliceRepository which is fine for this example but if you handle
// a massive volume of events you might want to move to something that will
// not grow in memory without limit.
func NewChannel(name string, srv *eventsource.Server) *Channel {
	channel := Channel{
		name,
		[]Comment{},
		eventsource.NewSliceRepository()}
	srv.Register(channel.Name, channel.Repo)
	return &channel
}

type Network struct {
	Channels map[string]*Channel
	Repo     *eventsource.SliceRepository
	srv      *eventsource.Server
}

func NewNetwork(srv *eventsource.Server) *Network {
	network := Network{
		Channels: make(map[string]*Channel),
		Repo:     eventsource.NewSliceRepository(),
		srv:      srv}
	srv.Register("channels", network.Repo)
	return &network
}

func (n *Network) AddChannel(channel *Channel) {
	n.Channels[channel.Name] = channel
	n.srv.Publish([]string{"channels"},
		&ChannelAddition{channel.Name, channel.Name})
}

var idx = IdGenerator{}

func replayLastMessages(n int, channel *Channel, srv *eventsource.Server) {
	for {
		data := channel.Data
		for i := range data[len(data)-n:] {
			srv.Publish([]string{channel.Name}, &data[i])
		}
		<-time.After(time.Second * 5)
	}
}

func main() {
	srv := eventsource.NewServer()
	network := NewNetwork(srv)
	defer srv.Close()

	sample := []Comment{
		{strconv.Itoa(idx.Next()), "yml", "Governments **struggle** to control global price of gas"},
		{strconv.Itoa(idx.Next()), "marco", "Tomorrow is _another_ day"},
		{strconv.Itoa(idx.Next()), "martin", "News for news' sake"},
	}
	// populate the sample channel with initial data
	network.Channels["sample"] = NewChannel("sample", srv)
	for i := range sample {
		network.Channels["sample"].Add(&sample[i])
	}

	// go replayLastMessages(2, channels["sample"], srv)
	m := martini.Classic()

	m.Get("/channels", func() string {
		channelList := []string{}
		for k, _ := range network.Channels {
			channelList = append(channelList, k)
		}
		b, _ := json.Marshal(channelList)
		return string(b)

	})

	// Api endpoint that returns a json string with all the comments
	m.Get("/:channel", func(params martini.Params) string {
		channel, ok := network.Channels[params["channel"]]
		if !ok {
			channel = NewChannel(params["channel"], srv)
			network.AddChannel(channel)
		}
		b, _ := json.Marshal(channel.Data)
		return string(b)
	})

	// Api endpoint to create new comments
	m.Post("/:channel", func(req *http.Request, params martini.Params) string {
		channel, ok := network.Channels[params["channel"]]
		if !ok {
			channel = NewChannel(params["channel"], srv)
			network.AddChannel(channel)
		}
		author, text := req.FormValue("author"), req.FormValue("text")
		cmt := Comment{strconv.Itoa(idx.Next()), author, text}
		channel.Add(&cmt)
		srv.Publish([]string{channel.Name}, &cmt)
		b, _ := json.Marshal(&cmt)
		return string(b)
	})

	// eventsource endpoints
	m.Get("/:channel/eventsource", func(w http.ResponseWriter, req *http.Request, params martini.Params) {
		srv.Handler(params["channel"])(w, req)
	})
	m.Run()
}
