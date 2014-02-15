package main

import (
	"encoding/json"
	"time"

	"github.com/codegangsta/martini"
	"github.com/donovanhide/eventsource"
)

type Comment struct {
	id           string
	Author, Text string
}

func (c *Comment) Id() string    { return c.id }
func (c *Comment) Event() string { return "comment" }
func (c *Comment) Data() string {
	b, _ := json.Marshal(c)
	return string(b)
}

var comments = []Comment{
	{"11", "yml", "Governments struggle to control global price of gas"},
	{"12", "marco", "Tomorrow is another day"},
	{"13", "martin", "News for news' sake"},
}

func newRepo(srv *eventsource.Server) *eventsource.SliceRepository {
	repo := eventsource.NewSliceRepository()
	srv.Register("comments", repo)
	for i := range comments {
		repo.Add("comments", &comments[i])
	}
	return repo
}

func replayRepo(srv *eventsource.Server, repo *eventsource.SliceRepository) {
	for {
		// Hard coding the replay from 12
		for event := range repo.Replay("comments", "12") {
			srv.Publish([]string{"comments"}, event)
		}
		<-time.After(time.Second * 5)
	}
}

func main() {
	srv := eventsource.NewServer()
	defer srv.Close()
	repo := newRepo(srv)
	go replayRepo(srv, repo)

	m := martini.Classic()
	m.Get("/hello", func() string {
		return "Hello world!"
	})
	m.Get("/eventsource", srv.Handler("comments"))
	m.Run()
}
