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

type IdGenerator struct {
	val int
}

func (idg *IdGenerator) Next() int {
	idg.val += 1
	return idg.val
}

var (
	idx      = IdGenerator{}
	comments = []Comment{
		{strconv.Itoa(idx.Next()), "yml", "Governments **struggle** to control global price of gas"},
		{strconv.Itoa(idx.Next()), "marco", "Tomorrow is _another_ day"},
		{strconv.Itoa(idx.Next()), "martin", "News for news' sake"},
	}
)

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
		for cmt := range repo.Replay("comments", "2") {
			srv.Publish([]string{"comments"}, cmt)
		}
		<-time.After(time.Second * 10)
	}
}

func main() {
	srv := eventsource.NewServer()
	defer srv.Close()
	repo := newRepo(srv)
	go replayRepo(srv, repo)

	m := martini.Classic()

	m.Get("/comments", func() string {
		b, _ := json.Marshal(comments)
		return string(b)
	})
	m.Post("/comments", func(req *http.Request) string {
		author, text := req.FormValue("author"), req.FormValue("text")
		cmt := &Comment{strconv.Itoa(idx.Next()), author, text}
		repo.Add("comments", cmt)
		srv.Publish([]string{"comments"}, cmt)
		b, _ := json.Marshal(cmt)
		return string(b)
	})

	m.Get("/eventsource", srv.Handler("comments"))
	m.Run()
}
